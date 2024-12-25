"""add player level

Revision ID: add_player_level
Revises: previous_revision
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_player_level'
down_revision = None  # or the previous revision id if it exists
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('players', sa.Column('level', sa.Integer, server_default='1'))

def downgrade():
    op.drop_column('players', 'level') 