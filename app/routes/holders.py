from flask import Blueprint, request, jsonify
from app.models import db, Holder
from app.schemas import HolderSchema
from sqlalchemy.exc import SQLAlchemyError

holders_bp = Blueprint('holders', __name__, url_prefix='/holders')
holder_schema = HolderSchema()
holders_schema = HolderSchema(many=True)


@holders_bp.route('/', methods=['GET'])
def get_holders():
    holders = Holder.query.all()
    return jsonify(holders_schema.dump(holders)), 200


@holders_bp.route('/<int:holder_id>/', methods=['GET'])
def get_holder(holder_id):
    holder = Holder.query.get_or_404(holder_id)
    return jsonify(holder_schema.dump(holder)), 200


@holders_bp.route('/', methods=['POST'])
def create_holder():
    data = request.get_json()
    try:
        holder = holder_schema.load(data, session=db.session)
        db.session.add(holder)
        db.session.commit()
        return jsonify(holder_schema.dump(holder)), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@holders_bp.route('/<int:holder_id>/', methods=['PUT'])
def update_holder(holder_id):
    holder = Holder.query.get_or_404(holder_id)
    data = request.get_json()
    try:
        updated_holder = holder_schema.load(
            data, instance=holder, session=db.session
        )
        db.session.commit()
        return jsonify(holder_schema.dump(updated_holder)), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@holders_bp.route('/<int:holder_id>/', methods=['DELETE', 'OPTIONS'])
def delete_holder(holder_id):
    holder = Holder.query.get_or_404(holder_id)
    try:
        db.session.delete(holder)
        db.session.commit()
        return jsonify({'message': 'Holder deleted'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@holders_bp.route('/<int:holder_id>/', methods=['PATCH'])
def patch_holder(holder_id):
    holder = Holder.query.get_or_404(holder_id)
    data = request.get_json()
    try:
        updated_holder = holder_schema.load(
            data, instance=holder, session=db.session, partial=True
        )
        db.session.commit()
        return holder_schema.jsonify(updated_holder), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
