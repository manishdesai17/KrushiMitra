package com.krushimitra.ai;

import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class MockAiProvider implements AiProvider {

    @Override
    public String respond(String question, String language, boolean hasImage) {
        String normalizedQuestion = question.toLowerCase(Locale.ROOT);
        String answer;

        if (containsAny(normalizedQuestion, "price", "mandi", "market", "ભાવ", "મંડી", "कीमत", "भाव")) {
            answer = marketAnswer(language);
        } else if (containsAny(normalizedQuestion, "pesticide", "fertilizer", "chemical", "દવા", "ખાતર", "જંતુનાશક", "दवा", "खाद", "कीटनाशक")) {
            answer = inputSafetyAnswer(language);
        } else if (containsAny(normalizedQuestion, "symptom", "disease", "yellow", "spot", "fungus", "રોગ", "લક્ષણ", "પીળા", "દાગ", "बीमारी", "लक्षण", "पीला", "धब्बा")) {
            answer = symptomAnswer(language);
        } else if (containsAny(normalizedQuestion, "irrigation", "watering", "water", "સિંચાઈ", "પાણી", "सिंचाई", "पानी")) {
            answer = irrigationAnswer(language);
        } else if (containsAny(normalizedQuestion, "stage", "growth", "harvest", "potato", "day", "વૃદ્ધિ", "લણણી", "બટાક", "દિવસ", "તબક્ક", "चरण", "कटाई", "आलू", "दिन")) {
            answer = cropProgressAnswer(language);
        } else {
            answer = generalAnswer(language);
        }

        return hasImage ? answer + " " + imageNotice(language) : answer;
    }

    private boolean containsAny(String question, String... terms) {
        for (String term : terms) {
            if (question.contains(term)) return true;
        }
        return false;
    }

    private String marketAnswer(String language) {
        return switch (language) {
            case "hi" -> "मंडी भाव के लिए ऐप का बाज़ार भाव पेज खोलें, फसल और स्थान चुनें, और आवक की तारीख ज़रूर देखें। मैं इस चैट में मौजूदा भाव सत्यापित या अनुमानित नहीं कर सकता।";
            case "en" -> "Open Mandi Prices in the app, choose the crop and location, and check the arrival date. I cannot verify or invent current prices in this chat.";
            default -> "મંડીના ભાવ માટે એપમાં બજાર ભાવ ખોલો, પાક અને સ્થળ પસંદ કરો અને આવકની તારીખ તપાસો. આ વાતચીતમાં હું હાલના ભાવ ચકાસી કે બનાવી શકતો નથી.";
        };
    }

    private String inputSafetyAnswer(String language) {
        return switch (language) {
            case "hi" -> "यह डेमो खाद या कीटनाशक की मात्रा तय नहीं कर सकता। उत्पाद का लेबल पढ़ें और उपयोग से पहले स्थानीय कृषि अधिकारी से सलाह लें; केवल चैट के आधार पर कोई रसायन न डालें।";
            case "en" -> "This demo cannot recommend a fertilizer or pesticide dose. Read the product label and consult a local agricultural officer before use; do not apply chemicals based only on chat.";
            default -> "આ ડેમો ખાતર કે જંતુનાશકની માત્રા નક્કી કરી શકતો નથી. ઉપયોગ પહેલાં ઉત્પાદનનું લેબલ વાંચો અને સ્થાનિક કૃષિ અધિકારીની સલાહ લો; માત્ર ચેટના આધારે દવાનો ઉપયોગ ન કરો.";
        };
    }

    private String irrigationAnswer(String language) {
        return switch (language) {
            case "hi" -> "सिंचाई का समय फसल, मिट्टी और मौसम पर निर्भर करता है। पहले मिट्टी की नमी और पानी रुकने की स्थिति देखें; फसल, मिट्टी और हाल के मौसम की जानकारी दें ताकि मैं सामान्य जाँच सूची दे सकूँ।";
            case "en" -> "Irrigation timing depends on the crop, soil, and weather. Check soil moisture and avoid waterlogging; share the crop, soil type, and recent weather for a general checklist.";
            default -> "સિંચાઈનો સમય પાક, જમીન અને હવામાન પર આધારિત છે. પહેલાં જમીનનો ભેજ તપાસો અને પાણી ભરાઈ ન રહે તેનું ધ્યાન રાખો; સામાન્ય તપાસ સૂચિ માટે પાક, જમીન અને તાજેતરના હવામાનની માહિતી આપો.";
        };
    }

    private String cropProgressAnswer(String language) {
        return switch (language) {
            case "hi" -> "यह ऐप बुवाई की तारीख और अनुमानित फसल अवधि से दिन और सामान्य चरण दिखाता है। फसल जोड़कर तारीख तथा अवधि दर्ज करें; यह वास्तविक खेत की स्थिति, फोटो या निदान नहीं है। किस्म और स्थानीय मौसम के अनुसार चरण बदल सकते हैं।";
            case "en" -> "The crop journey estimates the day and general stage from your sowing date and expected cycle length. Add those details to your crop record; it does not observe your field or diagnose crop condition. Variety and local weather can change timing.";
            default -> "આ એપ વાવણીની તારીખ અને અંદાજિત પાક સમય પરથી દિવસ અને સામાન્ય તબક્કો બતાવે છે. પાકની નોંધમાં તારીખ અને સમય ઉમેરો; આ ખેતરની વાસ્તવિક સ્થિતિનું નિરીક્ષણ કે નિદાન નથી. જાત અને સ્થાનિક હવામાનથી સમય બદલાઈ શકે છે.";
        };
    }

    private String symptomAnswer(String language) {
        return switch (language) {
            case "hi" -> "मैं लक्षणों से बीमारी की पुष्टि नहीं कर सकता। फसल और किस्म, लक्षण कब शुरू हुए, कहाँ दिखते हैं और हाल में सिंचाई/खाद की जानकारी लिखें; पुष्टि के लिए स्थानीय कृषि अधिकारी से संपर्क करें।";
            case "en" -> "I cannot confirm a disease from symptoms. Note the crop and variety, when and where symptoms began, and recent irrigation or fertilizer; ask a local agricultural officer to verify.";
            default -> "લક્ષણ પરથી હું રોગની ખાતરી કરી શકતો નથી. પાક અને જાત, લક્ષણ ક્યારથી અને ક્યાં દેખાય છે તથા તાજેતરની સિંચાઈ/ખાતરની માહિતી લખો; ખાતરી માટે સ્થાનિક કૃષિ અધિકારીનો સંપર્ક કરો.";
        };
    }

    private String generalAnswer(String language) {
        return switch (language) {
            case "hi" -> "मैं अभी सीमित डेमो मार्गदर्शन देता हूँ, लाइव AI या कृषि विशेषज्ञ नहीं हूँ। फसल और किस्म, गाँव/ज़िला, मिट्टी और फसल की अवस्था बताइए। बीमारी या रसायन के निर्णय स्थानीय कृषि अधिकारी से पक्का करें।";
            case "en" -> "I provide limited demo guidance, not live AI or expert advice. Share the crop and variety, village or district, soil type, and crop stage. Confirm disease or chemical decisions with a local agricultural officer.";
            default -> "હું હાલમાં મર્યાદિત ડેમો માર્ગદર્શન આપું છું, લાઇવ AI કે કૃષિ નિષ્ણાત નથી. પાક અને જાત, ગામ/જિલ્લો, જમીન અને પાકનો તબક્કો જણાવો. રોગ અથવા દવાના નિર્ણય સ્થાનિક કૃષિ અધિકારી પાસે ચકાસો.";
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
