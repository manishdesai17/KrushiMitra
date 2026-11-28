package com.krushimitra.dto.market;

import java.math.BigDecimal;

public record MarketPriceResponse(
        String state,
        String district,
        String market,
        String commodity,
        String variety,
        String arrivalDate,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        BigDecimal modalPrice) {
}
