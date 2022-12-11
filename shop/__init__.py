import os

from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from jd_flask_uploads import IMAGES, UploadSet, configure_uploads , patch_request_class
from flask_login import LoginManager
from flask_migrate import Migrate

app = Flask(__name__)
 
###################################
##### * DataBase Setup ############
###################################
app.config["SECRET_KEY"] = "1234567890098765412345678"
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] =  'sqlite:///'+ os.path.join(basedir, 'myshop.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

###################################
##### * Handling Images ###########
###################################

app.config['UPLOADED_PHOTOS_DEST'] = os.path.join(basedir, 'static/images')
photos = UploadSet('photos', IMAGES)
configure_uploads(app, photos)
patch_request_class(app)

migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'customerLogin'
login_manager.needs_refresh_message_category = 'danger'
login_manager.login_message = u"Please Login Sir/ Madam"

###################################
##### * Password Hashing ##########
###################################
bcrypt = Bcrypt(app)

###################################
##### * Routes ####################
###################################
with app.app_context():
    from shop.admin import routes
    from shop.products import routes
    from shop.carts import carts
    from shop.customers import routes