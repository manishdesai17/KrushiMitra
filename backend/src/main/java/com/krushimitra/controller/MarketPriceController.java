package com.krushimitra.controller;

import com.krushimitra.dto.market.MarketPriceResponse;
import com.krushimitra.service.MarketPriceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market/prices")
public class MarketPriceController {

    private final MarketPriceService marketPriceService;

    public MarketPriceController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping
    public List<MarketPriceResponse> search(
            @RequestParam String commodity,
            @RequestParam(defaultValue = "Gujarat") String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market) {
        return marketPriceService.search(commodity, state, district, market);
    }
}
