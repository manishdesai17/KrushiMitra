package com.krushimitra.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class MarketPriceServiceTest {

    @Test
    void requestsAndMapsOfficialMarketRecords() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        MarketPriceService service = new MarketPriceService(
                builder.baseUrl("https://api.data.gov.in").build(), "test-key");

        server.expect(request -> assertEquals(
                        "/resource/9ef84268-d588-465a-a308-a864a43d0070",
                        request.getURI().getPath()))
                .andExpect(method(HttpMethod.GET))
                .andExpect(request -> {
                    String query = URLDecoder.decode(request.getURI().getRawQuery(), StandardCharsets.UTF_8);
                    assertTrue(query.contains("api-key=test-key"));
                    assertTrue(query.contains("filters[commodity]=Potato"));
                    assertTrue(query.contains("filters[district]=Banaskantha"));
                })
                .andRespond(withSuccess("""
                        {"records":[{"state":"Gujarat","district":"Banaskantha","market":"Deesa",
                        "commodity":"Potato","variety":"Other","arrival_date":"27/11/2026",
                        "min_price":"800","max_price":"1400","modal_price":"1100"}]}
                        """, MediaType.APPLICATION_JSON));

        var records = service.search("Potato", "Gujarat", "Banaskantha", "");

        assertEquals(1, records.size());
        assertEquals("Deesa", records.get(0).market());
        assertEquals("27/11/2026", records.get(0).arrivalDate());
        assertEquals(0, records.get(0).modalPrice().compareTo(new java.math.BigDecimal("1100")));
        server.verify();
    }

    @Test
    void reportsMissingServerApiKeyInsteadOfReturningFakePrices() {
        MarketPriceService service = new MarketPriceService(
                RestClient.builder().baseUrl("https://api.data.gov.in").build(), "");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.search("Potato", "Gujarat", "", ""));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    }
}
