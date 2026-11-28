package com.krushimitra.ai;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MockAiProviderTest {

    private final MockAiProvider provider = new MockAiProvider();

    @Test
    void routesMarketQuestionsWithoutInventingPrices() {
        String answer = provider.respond("What is the potato mandi price?", "en", false);

        assertTrue(answer.contains("Mandi Prices"));
        assertFalse(answer.contains("₹"));
    }

    @Test
    void explainsEstimatedCropStagesInTheRequestedLanguage() {
        String answer = provider.respond("આજે બટાકાનો કયો દિવસ છે?", "gu", false);

        assertTrue(answer.contains("વાવણીની તારીખ"));
        assertTrue(answer.contains("નિદાન નથી"));
    }

    @Test
    void warnsThatUploadedImagesAreNotDiagnosed() {
        String answer = provider.respond("पत्तियों पर पीले धब्बे हैं", "hi", true);

        assertTrue(answer.contains("बीमारी की पुष्टि"));
        assertTrue(answer.contains("चित्र से बीमारी"));
    }
}
