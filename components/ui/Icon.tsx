import React from 'react';
import Svg, { Path, Line, Circle, Polyline, Rect, Polygon, G } from 'react-native-svg';

type IconName =
  | 'home' | 'barbell' | 'moon' | 'spark' | 'person'
  | 'plus' | 'trash' | 'folder' | 'chevron-right' | 'chevron-left'
  | 'drop' | 'wave' | 'lock' | 'download' | 'sync'
  | 'bell' | 'eye' | 'leaf' | 'check' | 'arrow-right' | 'arrow-left'
  | 'card' | 'star' | 'smile-bad' | 'smile-neutral' | 'smile-good'
  | 'smile-great' | 'energized' | 'heart' | 'brain' | 'pain'
  | 'craving' | 'sleep' | 'digestion' | 'pill' | 'shield'
  | 'search' | 'close' | 'arr-l' | 'arr-r' | 'chevr' | 'edit';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.4 }: Props) {
  const props = { width: size, height: size, viewBox: '0 0 28 28', fill: 'none' };
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'home':
      return <Svg {...props}><Path d="M4 12L14 4l10 8v12h-8v-6h-4v6H4z" {...s} /></Svg>;
    case 'barbell':
      return <Svg {...props}>
        <Line x1="4" y1="14" x2="24" y2="14" {...s} />
        <Line x1="4" y1="11" x2="7" y2="11" {...s} />
        <Line x1="4" y1="17" x2="7" y2="17" {...s} />
        <Line x1="21" y1="11" x2="24" y2="11" {...s} />
        <Line x1="21" y1="17" x2="24" y2="17" {...s} />
        <Line x1="7" y1="9" x2="7" y2="19" {...s} />
        <Line x1="21" y1="9" x2="21" y2="19" {...s} />
      </Svg>;
    case 'moon':
      return <Svg {...props}><Path d="M18 6A10 10 0 1 0 18 22 7 7 0 1 1 18 6z" {...s} /></Svg>;
    case 'spark':
      return <Svg {...props}>
        <Line x1="14" y1="4" x2="14" y2="8" {...s} />
        <Line x1="14" y1="20" x2="14" y2="24" {...s} />
        <Line x1="4" y1="14" x2="8" y2="14" {...s} />
        <Line x1="20" y1="14" x2="24" y2="14" {...s} />
        <Line x1="7" y1="7" x2="10" y2="10" {...s} />
        <Line x1="18" y1="18" x2="21" y2="21" {...s} />
        <Line x1="21" y1="7" x2="18" y2="10" {...s} />
        <Line x1="7" y1="21" x2="10" y2="18" {...s} />
      </Svg>;
    case 'person':
      return <Svg {...props}>
        <Circle cx="14" cy="10" r="4" {...s} />
        <Path d="M6 24q0-6 8-6t8 6" {...s} />
      </Svg>;
    case 'plus':
      return <Svg {...props}>
        <Line x1="14" y1="5" x2="14" y2="23" {...s} />
        <Line x1="5" y1="14" x2="23" y2="14" {...s} />
      </Svg>;
    case 'trash':
      return <Svg {...props}>
        <Polyline points="6,8 22,8" {...s} />
        <Path d="M10 8V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" {...s} />
        <Rect x="8" y="8" width="12" height="14" rx="1" {...s} />
      </Svg>;
    case 'folder':
      return <Svg {...props}><Path d="M4 8h8l2 2h10v12H4z" {...s} /></Svg>;
    case 'chevron-right':
      return <Svg {...props}><Polyline points="10,6 18,14 10,22" {...s} /></Svg>;
    case 'chevron-left':
      return <Svg {...props}><Polyline points="18,6 10,14 18,22" {...s} /></Svg>;
    case 'drop':
      return <Svg {...props}><Path d="M14 5q6 8 6 12a6 6 0 0 1-12 0q0-4 6-12z" {...s} /></Svg>;
    case 'wave':
      return <Svg {...props}><Path d="M3 14q4-6 8 0t8 0q4-6 6 0" {...s} /></Svg>;
    case 'lock':
      return <Svg {...props}>
        <Rect x="7" y="13" width="14" height="10" rx="2" {...s} />
        <Path d="M10 13v-3a4 4 0 0 1 8 0v3" {...s} />
      </Svg>;
    case 'download':
      return <Svg {...props}>
        <Line x1="14" y1="5" x2="14" y2="19" {...s} />
        <Polyline points="8,13 14,19 20,13" {...s} />
        <Line x1="5" y1="23" x2="23" y2="23" {...s} />
      </Svg>;
    case 'sync':
      return <Svg {...props}>
        <Path d="M6 14A8 8 0 0 1 21 9" {...s} />
        <Polyline points="18,6 21,9 18,12" {...s} />
        <Path d="M22 14A8 8 0 0 1 7 19" {...s} />
        <Polyline points="10,22 7,19 10,16" {...s} />
      </Svg>;
    case 'bell':
      return <Svg {...props}>
        <Path d="M10 20a4 2 0 0 0 8 0" {...s} />
        <Path d="M9 10a5 5 0 0 1 10 0l1 9H8z" {...s} />
      </Svg>;
    case 'eye':
      return <Svg {...props}>
        <Path d="M4 14q10-9 20 0-10 9-20 0" {...s} />
        <Circle cx="14" cy="14" r="3" {...s} />
      </Svg>;
    case 'leaf':
      return <Svg {...props}>
        <Path d="M6 22q2-12 14-14-2 12-14 14z" {...s} />
        <Line x1="6" y1="22" x2="14" y2="14" {...s} />
      </Svg>;
    case 'check':
      return <Svg {...props}><Polyline points="5,15 11,21 23,8" strokeWidth={1.6} stroke={color} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'arrow-right':
      return <Svg {...props}>
        <Line x1="5" y1="14" x2="23" y2="14" {...s} />
        <Polyline points="16,7 23,14 16,21" {...s} />
      </Svg>;
    case 'arrow-left':
      return <Svg {...props}>
        <Line x1="23" y1="14" x2="5" y2="14" {...s} />
        <Polyline points="12,7 5,14 12,21" {...s} />
      </Svg>;
    case 'card':
      return <Svg {...props}>
        <Rect x="3" y="7" width="22" height="14" rx="2" {...s} />
        <Line x1="3" y1="12" x2="25" y2="12" {...s} />
        <Line x1="7" y1="17" x2="11" y2="17" {...s} />
      </Svg>;
    case 'star':
      return <Svg {...props}><Polygon points="14,4 17,11 25,11 19,16 21,23 14,19 7,23 9,16 3,11 11,11" {...s} /></Svg>;
    case 'smile-bad':
      return <Svg {...props}>
        <Circle cx="14" cy="14" r="9" {...s} />
        <Path d="M10 18q4-4 8 0" {...s} />
      </Svg>;
    case 'smile-neutral':
      return <Svg {...props}>
        <Circle cx="14" cy="14" r="9" {...s} />
        <Line x1="10" y1="17" x2="18" y2="17" {...s} />
      </Svg>;
    case 'smile-good':
      return <Svg {...props}>
        <Circle cx="14" cy="14" r="9" {...s} />
        <Path d="M10 15q4 5 8 0" {...s} />
      </Svg>;
    case 'smile-great':
      return <Svg {...props}>
        <Circle cx="14" cy="14" r="9" {...s} />
        <Path d="M9 14q5 7 10 0" {...s} />
        <Circle cx="11" cy="12" r="1" fill={color} stroke="none" />
        <Circle cx="17" cy="12" r="1" fill={color} stroke="none" />
      </Svg>;
    case 'energized':
      return <Svg {...props}>
        <Path d="M16 4L8 15h6l-2 9 8-12h-6z" {...s} />
      </Svg>;
    case 'heart':
      return <Svg {...props}><Path d="M14 22S5 16 5 10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12z" {...s} /></Svg>;
    case 'brain':
      return <Svg {...props}>
        <Path d="M9 6a5 5 0 0 1 5 5v8" {...s} />
        <Path d="M19 6a5 5 0 0 0-5 5" {...s} />
        <Path d="M7 11a3 3 0 0 0 2 2.8" {...s} />
        <Path d="M21 11a3 3 0 0 1-2 2.8" {...s} />
        <Path d="M9 19a3 3 0 0 0 5 0" {...s} />
      </Svg>;
    case 'pain':
      return <Svg {...props}>
        <Line x1="14" y1="4" x2="14" y2="10" {...s} />
        <Line x1="14" y1="18" x2="14" y2="24" {...s} />
        <Line x1="4" y1="14" x2="10" y2="14" {...s} />
        <Line x1="18" y1="14" x2="24" y2="14" {...s} />
      </Svg>;
    case 'craving':
      return <Svg {...props}><Path d="M5 14q3-8 9-8t9 8-9 8-9-8z" {...s} /></Svg>;
    case 'sleep':
      return <Svg {...props}><Path d="M18 6A10 10 0 1 1 8 22a7 7 0 1 0 10-16z" {...s} /></Svg>;
    case 'digestion':
      return <Svg {...props}>
        <Circle cx="14" cy="14" r="8" {...s} />
        <Path d="M10 14q2 3 4 0t4 0" {...s} />
      </Svg>;
    case 'pill':
      return <Svg {...props}>
        <Rect x="8" y="10" width="12" height="8" rx="4" {...s} transform="rotate(-30 14 14)" />
        <Line x1="11" y1="11" x2="17" y2="17" {...s} />
      </Svg>;
    case 'shield':
      return <Svg {...props}><Path d="M14 4l8 4v6c0 4-8 10-8 10S6 18 6 14v-6z" {...s} /></Svg>;
    case 'search':
      return <Svg {...props}>
        <Circle cx="12" cy="12" r="7" {...s} />
        <Line x1="17.5" y1="17.5" x2="24" y2="24" {...s} />
      </Svg>;
    case 'close':
      return <Svg {...props}>
        <Line x1="6" y1="6" x2="22" y2="22" {...s} />
        <Line x1="22" y1="6" x2="6" y2="22" {...s} />
      </Svg>;
    case 'arr-l':
      return <Svg {...props}>
        <Line x1="23" y1="14" x2="5" y2="14" {...s} />
        <Polyline points="12,7 5,14 12,21" {...s} />
      </Svg>;
    case 'arr-r':
      return <Svg {...props}>
        <Line x1="5" y1="14" x2="23" y2="14" {...s} />
        <Polyline points="16,7 23,14 16,21" {...s} />
      </Svg>;
    case 'chevr':
      return <Svg {...props}><Polyline points="10,6 18,14 10,22" {...s} /></Svg>;
    case 'edit':
      return <Svg {...props}>
        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" {...s} />
        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" {...s} />
      </Svg>;
    default:
      return <Svg {...props}><Circle cx="14" cy="14" r="8" {...s} /></Svg>;
  }
}
