'use client';

import { useState, useEffect } from 'react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import Image from 'next/image';

interface GameBoardProps {
  gameState: any;
  currentPlayerId: string;
  onDrawCard: () => void;
  onPlayCard: (card: any, index: number) => void;
  onStartGame: () => void;
}

export default function GameBoard({ gameState, currentPlayerId, onDrawCard, onPlayCard, onStartGame }: GameBoardProps) {
  const { players, deck, discardPile, turnIndex, gameState: status } = gameState;

  const currentPlayerIndex = players.findIndex((p: any) => p.id === currentPlayerId);
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = players[turnIndex]?.id === currentPlayerId && status === 'playing';

  // Calculate opponents to arrange them around the table
  // This is a simple version: just list them at the top
  const opponents = players.filter((p: any) => p.id !== currentPlayerId);

  return (
    <div className="flex flex-col h-screen bg-[#006994] overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Sand texture or waves could go here */}
      </div>

      {/* Top Area: Opponents */}
      <div className="flex-1 flex justify-center items-start pt-4 gap-4 px-4 overflow-x-auto">
        {opponents.map((player: any) => {
            const isTurn = players[turnIndex]?.id === player.id;
            return (
                <div key={player.id} className={`flex flex-col items-center p-2 rounded-lg ${isTurn ? 'bg-yellow-400/30 border-2 border-yellow-400' : 'bg-black/20'}`}>
                    <div className="w-12 h-12 rounded-full bg-gray-300 mb-2 overflow-hidden border-2 border-white relative">
                         {/* Avatar placeholder */}
                         <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-600">
                             {player.name.charAt(0)}
                         </div>
                    </div>
                    <span className="text-white text-sm font-bold truncate max-w-[80px]">{player.name}</span>
                    <div className="flex items-center gap-1 mt-1 bg-black/40 px-2 py-0.5 rounded-full">
                        <div className="w-3 h-4 bg-orange-500 rounded-sm"></div>
                        <span className="text-white text-xs">{player.hand ? player.hand.length : 0}</span>
                    </div>
                    {!player.isAlive && <span className="text-red-500 font-bold text-xs mt-1">DEAD</span>}
                </div>
            );
        })}
      </div>

      {/* Center Area: Deck & Discard */}
      <div className="flex-[2] flex flex-col items-center justify-center gap-8 relative">

        {status === 'waiting' && currentPlayer?.isHost && (
            <button
                onClick={onStartGame}
                className="absolute z-50 bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl animate-bounce"
            >
                Bắt Đầu Game!
            </button>
        )}

        {status === 'waiting' && !currentPlayer?.isHost && (
            <div className="absolute z-50 text-white text-xl font-bold bg-black/50 p-4 rounded-lg">
                Đang chờ chủ phòng bắt đầu...
            </div>
        )}

        {status === 'ended' && (
             <div className="absolute z-50 bg-black/80 inset-0 flex items-center justify-center flex-col">
                 <h2 className="text-4xl text-yellow-400 font-bold mb-4">Game Over!</h2>
                 <p className="text-white text-2xl">
                     {players.find((p: any) => p.isAlive)?.name} chiến thắng!
                 </p>
                 <button onClick={() => window.location.reload()} className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-lg">
                     Chơi lại
                 </button>
             </div>
        )}

        <div className="flex gap-8 items-center">
            {/* Draw Pile */}
            <div className="relative group">
                {deck && deck.length > 0 ? (
                    <div onClick={() => isMyTurn && onDrawCard()} className={`relative ${isMyTurn ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}>
                        <Card isFaceUp={false} disabled={!isMyTurn} />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-blue-900 font-bold px-2 py-1 rounded-full text-xs shadow-md">
                            {deck.length} lá
                        </span>
                        {isMyTurn && <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-sm animate-pulse whitespace-nowrap">Rút Bài!</div>}
                    </div>
                ) : (
                    <div className="w-24 h-36 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white/30">
                        Hết bài
                    </div>
                )}
            </div>

            {/* Discard Pile */}
            <div className="relative">
                {discardPile && discardPile.length > 0 ? (
                    <div className="relative rotate-12">
                         <Card card={discardPile[discardPile.length - 1]} isFaceUp={true} disabled={true} />
                    </div>
                ) : (
                    <div className="w-24 h-36 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white/30">
                        Bài đánh
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Bottom Area: Player Hand */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm pt-2 pb-4 border-t border-white/10">
        <div className="flex justify-between px-4 items-center mb-2">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-yellow-400 overflow-hidden border-2 border-white">
                     {/* My Avatar */}
                     <div className="flex items-center justify-center h-full font-bold text-blue-900">
                         {currentPlayer?.name?.charAt(0)}
                     </div>
                </div>
                <div>
                    <div className="text-white font-bold">{currentPlayer?.name} (Bạn)</div>
                    <div className="text-xs text-teal-300">
                        {currentPlayer?.isAlive ? (isMyTurn ? 'Đến lượt bạn!' : 'Đợi xíu...') : 'Bạn đã nổ!'}
                    </div>
                </div>
            </div>

            {/* Action buttons or info could go here */}
        </div>

        {currentPlayer?.isAlive ? (
            <PlayerHand
                hand={currentPlayer?.hand || []}
                isCurrentPlayer={isMyTurn}
                onPlayCard={onPlayCard}
            />
        ) : (
            <div className="text-center text-red-400 font-bold py-8 text-xl">
                Bạn đã bị nổ tung! 💥
            </div>
        )}
      </div>
    </div>
  );
}
