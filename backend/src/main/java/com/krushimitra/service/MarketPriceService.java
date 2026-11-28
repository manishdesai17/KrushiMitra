package com.krushimitra.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.krushimitra.dto.market.MarketPriceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Service
public class MarketPriceService {

    private static final String RESOURCE_PATH =
            "/resource/9ef84268-d588-465a-a308-a864a43d0070";
    private static final int MAX_RESULTS = 50;

    private final RestClient restClient;
    private final String apiKey;

    @Autowired
    public MarketPriceService(@Value("${app.market.api-key:}") String apiKey) {
        this(RestClient.builder()
                .baseUrl("https://api.data.gov.in")
                .requestFactory(createRequestFactory())
                .build(), apiKey);
    }

    MarketPriceService(RestClient restClient, String apiKey) {
        this.restClient = restClient;
        this.apiKey = apiKey;
    }

    private static SimpleClientHttpRequestFactory createRequestFactory() {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(15));
        return requestFactory;
    }

    public List<MarketPriceResponse> search(String commodity, String state,
                                            String district, String market) {
        requireFilter(commodity, "commodity");
        requireFilter(state, "state");
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Official market prices require MARKET_DATA_API_KEY on the server.");
        }

        MarketDataResponse response;
        try {
            response = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path(RESOURCE_PATH)
                                .queryParam("api-key", apiKey)
                                .queryParam("format", "json")
                                .queryParam("limit", MAX_RESULTS)
                                .queryParam("filters[commodity]", commodity.strip())
                                .queryParam("filters[state]", state.strip());
                        if (district != null && !district.isBlank()) {
                            uriBuilder.queryParam("filters[district]", district.strip());
                        }
                        if (market != null && !market.isBlank()) {
                            uriBuilder.queryParam("filters[market]", market.strip());
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(MarketDataResponse.class);
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "The official market price service is temporarily unavailable.", exception);
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not read the official market price response.", exception);
        }

        if (response == null || response.records() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "The official market price service returned an invalid response.");
        }

        return response.records().stream()
                .limit(MAX_RESULTS)
                .map(record -> new MarketPriceResponse(record.state(), record.district(), record.market(),
                        record.commodity(), record.variety(), record.arrivalDate(),
                        record.minPrice(), record.maxPrice(), record.modalPrice()))
                .toList();
    }

    private void requireFilter(String value, String name) {
        if (value == null || value.isBlank() || value.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    name + " must be between 1 and 100 characters.");
        }
    }

    private record MarketDataResponse(List<MarketDataRecord> records) {
    }

    private record MarketDataRecord(
            String state,
            String district,
            String market,
            String commodity,
            String variety,
            @JsonProperty("arrival_date") String arrivalDate,
            @JsonProperty("min_price") BigDecimal minPrice,
            @JsonProperty("max_price") BigDecimal maxPrice,
            @JsonProperty("modal_price") BigDecimal modalPrice) {
    }
}
