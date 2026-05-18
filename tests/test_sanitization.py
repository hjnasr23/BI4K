import re

BANNED_WORDS_REGEX = re.compile(
    r"\b(nsfw|blood|violence|hate|racist|gore|kill|murder)\b",
    re.IGNORECASE,
)

def test_sanitization():
    banned_prompts = [
        "a nsfw image",
        "blood and violence",
        "hate speech",
        "gore scene",
        "kill them all",
        "murder mystery",
        "racist remark"
    ]
    safe_prompts = [
        "a cute cat",
        "cyberpunk city",
        "flower field",
        "mountain landscape",
        "abstract art"
    ]
    
    for prompt in banned_prompts:
        if BANNED_WORDS_REGEX.search(prompt) is None:
            print(f"FAILED: '{prompt}' should have been caught!")
            exit(1)
        
    for prompt in safe_prompts:
        if BANNED_WORDS_REGEX.search(prompt) is not None:
            print(f"FAILED: '{prompt}' should NOT have been caught!")
            exit(1)

if __name__ == "__main__":
    test_sanitization()
    print("Sanitization regex tests passed!")
