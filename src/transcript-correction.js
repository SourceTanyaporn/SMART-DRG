import { transcriptDictionary } from "./transcript-dictionary";

export const correctTranscript = (text) => {
    if (!text) return "";

    let result = text;

    Object.entries(transcriptDictionary).forEach(
        ([wrong, correct]) => {
            result = result.replaceAll(wrong, correct);
        }
    );

    return result;
};