# entry/entry/movie_chatbot.py
from groq import Groq

def movie_chatbot(query):
    client = Groq(api_key='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')
    
    default_response = "I'm a movie chatbot! Please ask me something related to movies, like movie recommendations, ratings, or details."
    
    movie_keywords = [
        'movie', 'film', 'cinema', 'actor', 'actress', 'director', 'genre', 
        'rating', 'imdb', 'plot', 'cast', 'release', 'trailer', 'review'
    ]
    is_movie_related = any(keyword in query.lower() for keyword in movie_keywords)
    
    if not is_movie_related:
        return default_response
    
    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b", 
            messages=[
                {
                    "role": "system",
                    "content": "You are a movie expert chatbot. Provide responses in a clean, numbered list format. Each movie should be on its own line with title, year, and quick hook. Use markdown-style formatting if needed."
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            temperature=1,
            max_completion_tokens=8192,
            top_p=1,
            stream=True,
            stop=None
        )
        
        response = ""
        for chunk in completion:
            response += chunk.choices[0].delta.content or ""
        
        
        if "Here are" in response and "|" in response:  # Detect table-like format
            lines = response.split("||")
            if len(lines) > 1:
                # Clean up and reformat
                formatted = "Here are some movie recommendations:\n\n"
                for i, line in enumerate(lines[1:], 1):  # Skip first empty part
                    parts = line.strip().split("|")
                    if len(parts) >= 4:
                        num = parts[0].strip()
                        title = parts[1].strip()
                        year = parts[2].strip()
                        hook = parts[3].strip()
                        formatted += f"{i}. **{title}** ({year})\n   {hook}\n\n"
                response = formatted
        
        return response.strip()
    
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}. Please try again with a movie-related question!"