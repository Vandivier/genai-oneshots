"""initial migration

Revision ID: 84201b4c032d
Revises: 
Create Date: 2024-12-24 23:13:34.019324

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84201b4c032d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('battler_cards',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('power_level', sa.Integer(), nullable=True),
    sa.Column('rarity', sa.Enum('COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY', name='rarity'), nullable=True),
    sa.Column('effect_description', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_battler_cards_id'), 'battler_cards', ['id'], unique=False)
    op.create_index(op.f('ix_battler_cards_name'), 'battler_cards', ['name'], unique=True)
    op.create_table('card_packs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_card_packs_id'), 'card_packs', ['id'], unique=False)
    op.create_table('players',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=True),
    sa.Column('gold', sa.Float(), nullable=True),
    sa.Column('card_collection', sa.JSON(), nullable=True),
    sa.Column('last_gold_update', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_players_id'), 'players', ['id'], unique=False)
    op.create_index(op.f('ix_players_username'), 'players', ['username'], unique=True)
    op.create_table('tags',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tags_id'), 'tags', ['id'], unique=False)
    op.create_index(op.f('ix_tags_name'), 'tags', ['name'], unique=True)
    op.create_table('card_effects',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('card_id', sa.Integer(), nullable=True),
    sa.Column('effect_type', sa.Enum('SPEED', 'ENERGY', 'CONDITIONAL', 'INTERRUPT', 'COUNTER', 'EARLY_ATTACK', name='effecttype'), nullable=True),
    sa.Column('speed_value', sa.Integer(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('trigger_condition', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['card_id'], ['battler_cards.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_card_effects_id'), 'card_effects', ['id'], unique=False)
    op.create_table('card_tags',
    sa.Column('card_id', sa.Integer(), nullable=False),
    sa.Column('tag_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['card_id'], ['battler_cards.id'], ),
    sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ),
    sa.PrimaryKeyConstraint('card_id', 'tag_id')
    )
    op.create_table('decks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('player_id', sa.Integer(), nullable=True),
    sa.Column('cards', sa.JSON(), nullable=True),
    sa.Column('is_starter', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_decks_id'), 'decks', ['id'], unique=False)
    op.create_table('dungeon_instances',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('player_id', sa.Integer(), nullable=True),
    sa.Column('current_floor', sa.Integer(), nullable=True),
    sa.Column('current_position', sa.JSON(), nullable=True),
    sa.Column('visited_cells', sa.JSON(), nullable=True),
    sa.Column('grid_size', sa.Integer(), nullable=True),
    sa.Column('layout', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dungeon_instances_id'), 'dungeon_instances', ['id'], unique=False)
    op.create_table('player_cards',
    sa.Column('player_id', sa.Integer(), nullable=False),
    sa.Column('card_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['card_id'], ['battler_cards.id'], ),
    sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
    sa.PrimaryKeyConstraint('player_id', 'card_id')
    )
    op.create_table('shops',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('featured_card_id', sa.Integer(), nullable=True),
    sa.Column('last_refresh', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['featured_card_id'], ['battler_cards.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shops_id'), 'shops', ['id'], unique=False)
    op.create_table('dungeon_encounters',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('dungeon_id', sa.Integer(), nullable=True),
    sa.Column('cell_type', sa.Enum('EMPTY', 'MONSTER', 'TREASURE', 'TRAP', 'EXIT', 'MERCHANT', 'SHRINE', 'MINIBOSS', 'SAFE', name='celltype'), nullable=True),
    sa.Column('position_x', sa.Integer(), nullable=True),
    sa.Column('position_y', sa.Integer(), nullable=True),
    sa.Column('is_completed', sa.Boolean(), nullable=True),
    sa.Column('data', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['dungeon_id'], ['dungeon_instances.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dungeon_encounters_id'), 'dungeon_encounters', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_dungeon_encounters_id'), table_name='dungeon_encounters')
    op.drop_table('dungeon_encounters')
    op.drop_index(op.f('ix_shops_id'), table_name='shops')
    op.drop_table('shops')
    op.drop_table('player_cards')
    op.drop_index(op.f('ix_dungeon_instances_id'), table_name='dungeon_instances')
    op.drop_table('dungeon_instances')
    op.drop_index(op.f('ix_decks_id'), table_name='decks')
    op.drop_table('decks')
    op.drop_table('card_tags')
    op.drop_index(op.f('ix_card_effects_id'), table_name='card_effects')
    op.drop_table('card_effects')
    op.drop_index(op.f('ix_tags_name'), table_name='tags')
    op.drop_index(op.f('ix_tags_id'), table_name='tags')
    op.drop_table('tags')
    op.drop_index(op.f('ix_players_username'), table_name='players')
    op.drop_index(op.f('ix_players_id'), table_name='players')
    op.drop_table('players')
    op.drop_index(op.f('ix_card_packs_id'), table_name='card_packs')
    op.drop_table('card_packs')
    op.drop_index(op.f('ix_battler_cards_name'), table_name='battler_cards')
    op.drop_index(op.f('ix_battler_cards_id'), table_name='battler_cards')
    op.drop_table('battler_cards')
    # ### end Alembic commands ###
