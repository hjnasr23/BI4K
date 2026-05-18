from services.ai_service import BANNED_WORDS_REGEX

def test_sanitization():
    banned_prompts = [
        "a nsfw image",
        "blood and violence",
        "hate speech",
        "gore scene",
    ]
    safe_prompts = [
        "a cute cat",
        "cyberpunk city",
        "flower field",
    ]
    
    for prompt in banned_prompts:
        assert BANNED_WORDS_REGEX.search(prompt) is not None
        
    for prompt in safe_prompts:
        assert BANNED_WORDS_REGEX.search(prompt) is None

if __name__ == "__main__":
    test_sanitization()
    print("Sanitization tests passed!")
