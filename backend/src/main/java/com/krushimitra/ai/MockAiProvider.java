package com.krushimitra.ai;

import org.springframework.stereotype.Component;

@Component
public class MockAiProvider implements AiProvider {

    @Override
    public String respond(String question, String language, boolean hasImage) {
        String context = hasImage
                ? imageNotice(language)
                : "";

        return switch (language) {
            case "hi" -> "यह शुरुआती सहायता है, पुष्ट निदान नहीं। कृपया फसल का नाम, किस्म, गाँव/ज़िला, मिट्टी का प्रकार और फसल की वर्तमान अवस्था बताएँ। बिना पर्याप्त जानकारी के उर्वरक, दवा या सिंचाई की निश्चित सलाह न दें। "
                    + "अभी पौधे की बनावट, पीलेपन का समय और हाल की सिंचाई/उर्वरक जानकारी दें। संदेह होने पर स्थानीय कृषि अधिकारी से संपर्क करें। " + context;
            case "en" -> "This is initial guidance, not a confirmed diagnosis. Please provide the crop name and variety, village or district, soil type, and current growth stage. Without enough context, do not make a specific fertilizer, pesticide, or irrigation decision. "
                    + "Share the symptom timing and recent irrigation or fertilizer activity. Consult a local agricultural officer if uncertain. " + context;
            default -> "આ પ્રારંભિક માર્ગદર્શન છે, નિશ્ચિત નિદાન નથી. કૃપા કરીને પાકનું નામ અને જાત, ગામ/જિલ્લો, જમીનનો પ્રકાર અને પાકનો હાલનો વૃદ્ધિ તબક્કો જણાવો. પૂરતી માહિતી વિના ખાતર, દવા કે પાણી અંગે નિશ્ચિત નિર્ણય ન કરો. "
                    + "લક્ષણ ક્યારે દેખાયા, છેલ્લી સિંચાઈ/ખાતર અને છોડની સ્થિતિની માહિતી આપો. શંકા થાય તો સ્થાનિક કૃષિ અધિકારીનો સંપર્ક કરો. " + context;
        };
    }

    private String imageNotice(String language) {
        return switch (language) {
            case "hi" -> "चित्र से बीमारी की पुष्टि नहीं की जा सकती। फोटो साफ़, लक्षण के पास और कई कोणों से लें।";
            case "en" -> "An image cannot confirm a disease diagnosis. Upload clear close-up and overall views when available.";
            default -> "ફોટામાંથી રોગની ખાતરીપૂર્વક ઓળખ થઈ શકતી નથી. સાફ close-up અને આખા છોડના ફોટા ઉપલબ્ધ હોય તો મોકલો.";
        };
    }
}
