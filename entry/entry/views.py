from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from .movie_chatbot import movie_chatbot  # Import your chatbot function

@method_decorator(csrf_exempt, name='dispatch')
class MovieChatAPIView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            user_query = data.get('message', '').strip()
            
            if not user_query:
                return JsonResponse({
                    'success': False,
                    'error': 'No message provided'
                }, status=400)
            
            # Call your chatbot
            bot_response = movie_chatbot(user_query)
            
            return JsonResponse({
                'success': True,
                'message': bot_response
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)