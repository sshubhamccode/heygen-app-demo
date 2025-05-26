from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import sqlite3
import bcrypt
import uuid
from datetime import datetime, timezone
import os

app = Flask(__name__)
CORS(app)

# Setup JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production
jwt = JWTManager(app)

# Database initialization
def get_db():
    db = sqlite3.connect('database.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with get_db() as conn:
        c = conn.cursor()
        
        # Create profiles table
        c.execute('''
            CREATE TABLE IF NOT EXISTS profiles (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create videos table
        c.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                original_url TEXT,
                processed_url TEXT,
                target_language TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES profiles (id)
            )
        ''')
        
        # Create avatar_generations table
        c.execute('''
            CREATE TABLE IF NOT EXISTS avatar_generations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                avatar_id TEXT NOT NULL,
                voice_id TEXT NOT NULL,
                text TEXT NOT NULL,
                video_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES profiles (id)
            )
        ''')
        
        conn.commit()

init_db()

# Authentication routes
@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        with get_db() as conn:
            c = conn.cursor()
            
            # Check if user exists
            c.execute('SELECT * FROM profiles WHERE email = ?', (email,))
            if c.fetchone():
                return jsonify({'error': 'Email already registered'}), 409
            
            # Create new user
            user_id = str(uuid.uuid4())
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            c.execute(
                'INSERT INTO profiles (id, email, password_hash) VALUES (?, ?, ?)',
                (user_id, email, password_hash)
            )
            
            conn.commit()
            
            # Create access token
            access_token = create_access_token(identity=user_id)
            
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user_id,
                    'email': email
                }
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        with get_db() as conn:
            c = conn.cursor()
            
            c.execute('SELECT id, email, password_hash FROM profiles WHERE email = ?', (email,))
            user = c.fetchone()
            
            if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
                return jsonify({'error': 'Invalid credentials'}), 401
            
            access_token = create_access_token(identity=user['id'])
            
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user['id'],
                    'email': user['email']
                }
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        user_id = get_jwt_identity()
        with get_db() as conn:
            c = conn.cursor()
            c.execute('SELECT id, email FROM profiles WHERE id = ?', (user_id,))
            user = c.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            return jsonify({
                'user': {
                    'id': user['id'],
                    'email': user['email']
                }
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Protected routes
@app.route('/videos', methods=['GET'])
@jwt_required()
def get_videos():
    user_id = get_jwt_identity()
    
    try:
        with get_db() as conn:
            c = conn.cursor()
            
            c.execute('SELECT * FROM videos WHERE user_id = ?', (user_id,))
            videos = c.fetchall()
            
            return jsonify({
                'videos': [{
                    'id': video['id'],
                    'name': video['name'],
                    'original_url': video['original_url'],
                    'processed_url': video['processed_url'],
                    'target_language': video['target_language'],
                    'status': video['status']
                } for video in videos]
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/videos', methods=['POST'])
@jwt_required()
def create_video():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        with get_db() as conn:
            c = conn.cursor()
            
            video_id = str(uuid.uuid4())
            c.execute('''
                INSERT INTO videos (id, user_id, name, original_url, processed_url, target_language, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                video_id,
                user_id,
                data['name'],
                data.get('original_url'),
                data.get('processed_url'),
                data['target_language'],
                data.get('status', 'pending')
            ))
            
            conn.commit()
            
            return jsonify({
                'id': video_id,
                'message': 'Video created successfully'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/avatar-generations', methods=['GET'])
@jwt_required()
def get_avatar_generations():
    user_id = get_jwt_identity()
    
    try:
        with get_db() as conn:
            c = conn.cursor()
            
            c.execute('SELECT * FROM avatar_generations WHERE user_id = ?', (user_id,))
            generations = c.fetchall()
            
            return jsonify({
                'generations': [{
                    'id': gen['id'],
                    'avatar_id': gen['avatar_id'],
                    'voice_id': gen['voice_id'],
                    'text': gen['text'],
                    'video_url': gen['video_url']
                } for gen in generations]
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/avatar-generations', methods=['POST'])
@jwt_required()
def create_avatar_generation():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        with get_db() as conn:
            c = conn.cursor()
            
            generation_id = str(uuid.uuid4())
            c.execute('''
                INSERT INTO avatar_generations (id, user_id, avatar_id, voice_id, text, video_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                generation_id,
                user_id,
                data['avatar_id'],
                data['voice_id'],
                data['text'],
                data.get('video_url')
            ))
            
            conn.commit()
            
            return jsonify({
                'id': generation_id,
                'message': 'Avatar generation created successfully'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)