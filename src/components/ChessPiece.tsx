import React from 'react';
import { PieceColor, PieceType } from '../types';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = '' }) => {
  const isWhite = color === 'w';
  const t = type.toLowerCase();

  // Crisp standard vector chess set (Cburnett / Lichess style)
  switch (t) {
    case 'p': // PAWN
      return isWhite ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${className}`}
        >
          <path
            d="m22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill="#FFFFF5"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${className}`}
        >
          <path
            d="m22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill="#000000"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'r': // ROOK
      return isWhite ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${className}`}
        >
          <g
            fill="#FFFFF5"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm2-4V17h17v14H14zm-5-14V9h4v4h5V9h4v4h5V9h4v5H9z"
              strokeLinecap="butt"
            />
            <path d="M12 35.5h21" />
            <path d="M13 31.5h19" />
            <path d="M14 29.5h17" />
            <path d="M14 16.5h17" />
            <path d="M11 14h23" />
          </g>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${className}`}
        >
          <g
            fill="#000000"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm2-4V17h17v14H14zm-5-14V9h4v4h5V9h4v4h5V9h4v5H9z"
              strokeLinecap="butt"
            />
            <path d="M12 35.5h21" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M13 31.5h19" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M14 16.5h17" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M11 14h23" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'n': // KNIGHT
      return isWhite ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${className}`}
        >
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
              fill="#FFFFF5"
            />
            <path
              d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.03,5.04 18.5,5.5 C 19.82,5.9 20.09,7.74 20,8.5 C 19.68,10.2 21.05,10.8 22,10 z"
              fill="#FFFFF5"
            />
            <circle cx="14.5" cy="15.5" r="1" fill="#000000" />
            <path
              d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
              fill="#000000"
            />
          </g>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${className}`}
        >
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
              fill="#000000"
            />
            <path
              d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.03,5.04 18.5,5.5 C 19.82,5.9 20.09,7.74 20,8.5 C 19.68,10.2 21.05,10.8 22,10 z"
              fill="#000000"
            />
            <circle cx="14.5" cy="15.5" r="1.2" fill="#FFFFFF" />
            <path
              d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z"
              fill="#FFFFFF"
            />
          </g>
        </svg>
      );

    case 'b': // BISHOP
      return isWhite ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${className}`}
        >
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g fill="#FFFFF5" stroke="#000000" strokeWidth="1.8" strokeLinecap="butt">
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-2.5-2.5h5" strokeLinejoin="miter" />
          </g>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${className}`}
        >
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g fill="#000000" stroke="#000000" strokeWidth="1.8" strokeLinecap="butt">
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path
              d="M17.5 26h10M15 30h15m-7.5-14.5v5m-2.5-2.5h5"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinejoin="miter"
            />
          </g>
        </svg>
      );

    case 'q': // QUEEN
      return isWhite ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${className}`}
        >
          <g
            fill="#FFFFF5"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM15 10a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm19 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <path
              d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14l-7-11 2 12z"
              strokeLinecap="butt"
            />
            <path
              d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
              strokeLinecap="butt"
            />
            <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" />
            <path d="M11 29a35 35 1 0 1 23 0" fill="none" />
            <path d="M12.5 31.5h20" fill="none" />
            <path d="M11.5 34.5a35 35 1 0 0 22 0" fill="none" />
            <path d="M10.5 37.5a35 35 1 0 0 24 0" fill="none" />
          </g>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${className}`}
        >
          <g
            fill="#000000"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM15 10a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm19 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <path
              d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14l-7-11 2 12z"
              strokeLinecap="butt"
            />
            <path
              d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
              strokeLinecap="butt"
            />
            <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M11 29a35 35 1 0 1 23 0" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
            <path d="M12.5 31.5h20" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'k': // KING
      return isWhite ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${className}`}
        >
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path
              d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
              fill="#FFFFF5"
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            <path
              d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23v-1.5C19 14.5 9.5 11.5 5.5 18c-3 6 6 10.5 6 10.5v8.5z"
              fill="#FFFFF5"
            />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
          </g>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 45 45"
          className={`w-full h-full select-none pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${className}`}
        >
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path
              d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
              fill="#000000"
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            <path
              d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23v-1.5C19 14.5 9.5 11.5 5.5 18c-3 6 6 10.5 6 10.5v8.5z"
              fill="#000000"
            />
            <path
              d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
            <circle cx="22.5" cy="20" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
