from flask import Flask, request, jsonify, send_from_directory
import json
import requests
from io import BytesIO
from PIL import Image
import base64, os, random

global_variables = {}

app = Flask(__name__, static_url_path='', static_folder='static')
IMAGE_SAVE_PATH = 'static/assets/images'

# Global variable containing the template string
TEMPLATE_STRING = "({__stomach__,|__hipsThighsLegs__,|__stomach__, __hipsThighsLegs__,|} {__outfit__,|__traits__,|} , (__eyeColor__ eyes:1.2), __tops__, __bottoms__, __backgrounds__)"

@app.route('/replace-wildcards', methods=['POST'])
def replace_wildcards():
    data = request.json
    result_string = TEMPLATE_STRING
    for key, value in data.items():
        wildcard = f"__{key}__"
        result_string = result_string.replace(wildcard, value)
    return jsonify({'result': result_string})

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('static', path)

@app.route('/update_globals', methods=['POST'])
def update_globals():
    data = request.json
    for key, value in data.items():
        if key in global_variables:
            global_variables[key].append(value)
        else:
            global_variables[key] = [value]
    return jsonify(global_variables)

@app.route('/dynamic', methods=['GET'])
def get_random_lines():
    query_params = request.args.keys()
    response_dict = {}
    for param in query_params:
        response_dict[param] = []
        try:
            file_name = f"{param}.txt"
            if os.path.exists(file_name):
                with open(file_name, 'r') as file:
                    lines = file.readlines()
                    if lines:
                        response_dict[param].append(random.choice(lines).strip())
        except Exception as e:
            print(f"Error processing {param}: {e}")
    return jsonify(response_dict)

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    json_file_path = 'static/assets/json/data.json'
    with open(json_file_path, 'r') as file:
        json_template = json.load(file)

    request_data = request.json

    # Handle direct key-value overwrites
    for key, value in request_data.get("overwrite", {}).items():
        json_template[key] = value

    # Handle positive replacements
    if "positive_replacements" in request_data:
        for key, value in request_data["positive_replacements"].items():
            if "prompt" in json_template:
                json_template["prompt"] = json_template["prompt"].replace(f"__{key}__", value)
    
    # Handle negative replacements
    if "negative_replacements" in request_data:
        for key, value in request_data["negative_replacements"].items():
            if "negative_prompt" in json_template:
                json_template["negative_prompt"] = json_template["negative_prompt"].replace(f"__{key}__", value)

    url = 'http://127.0.0.1:7860/sdapi/v1/txt2img'

    try:
        response = requests.post(url, json=json_template)
        if response.status_code == 200:
            response_data = response.json()
            if 'images' in response_data and len(response_data['images']) > 0:
                image_data = response_data['images'][0]
                
                image_bytes = base64.b64decode(image_data)
                image = Image.open(BytesIO(image_bytes))
                if not os.path.exists(IMAGE_SAVE_PATH):
                    os.makedirs(IMAGE_SAVE_PATH)
                image_save_path = os.path.join(IMAGE_SAVE_PATH, 'output_image.png')
                image.save(image_save_path)
                
                return jsonify({'image': image_data, 'message': f'Image saved to {image_save_path}'})
            else:
                return jsonify({'error': 'No images were returned.'}), 404
        else:
            return jsonify({'error': f'Failed to retrieve data. Status code: {response.status_code}'}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
