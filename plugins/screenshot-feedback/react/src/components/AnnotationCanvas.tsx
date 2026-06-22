import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Arrow, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type {
  AnnotationShape,
  AnnotationLine,
  AnnotationArrow,
  AnnotationRect,
  AnnotationText,
} from '../types';

export type AnnotationTool = 'pen' | 'highlight' | 'arrow' | 'rect' | 'text' | 'none';

export interface AnnotationCanvasHandle {
  exportDataUrl: () => string | null;
  clear: () => void;
  undo: () => void;
}

interface Props {
  imageDataUrl: string;
  tool: AnnotationTool;
  color: string;
  maxWidth: number;
  maxHeight: number;
}

let shapeId = 0;
const nextId = () => `s-${++shapeId}`;

export const AnnotationCanvas = forwardRef<AnnotationCanvasHandle, Props>(
  ({ imageDataUrl, tool, color, maxWidth, maxHeight }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [shapes, setShapes] = useState<AnnotationShape[]>([]);
    const drawing = useRef(false);
    const startPoint = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setImage(img);
      img.src = imageDataUrl;
    }, [imageDataUrl]);

    const dims = useMemo(() => {
      if (!image) return { width: maxWidth, height: maxHeight, scale: 1 };
      const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
      return {
        width: image.naturalWidth * scale,
        height: image.naturalHeight * scale,
        scale,
      };
    }, [image, maxWidth, maxHeight]);

    useImperativeHandle(ref, () => ({
      exportDataUrl: () => {
        if (!stageRef.current || !image) return null;
        return stageRef.current.toDataURL({
          pixelRatio: 1 / dims.scale,
          mimeType: 'image/png',
        });
      },
      clear: () => setShapes([]),
      undo: () => setShapes((prev) => prev.slice(0, -1)),
    }));

    const getPos = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const pos = e.target.getStage()?.getPointerPosition();
      return pos ?? { x: 0, y: 0 };
    };

    const handleDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (tool === 'none') return;
      const pos = getPos(e);
      drawing.current = true;
      startPoint.current = pos;

      if (tool === 'pen' || tool === 'highlight') {
        const shape: AnnotationLine = {
          id: nextId(),
          tool,
          color,
          strokeWidth: tool === 'highlight' ? 18 : 3,
          points: [pos.x, pos.y],
        };
        setShapes((s) => [...s, shape]);
      } else if (tool === 'rect') {
        const shape: AnnotationRect = {
          id: nextId(),
          color,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
        };
        setShapes((s) => [...s, shape]);
      } else if (tool === 'arrow') {
        const shape: AnnotationArrow = {
          id: nextId(),
          color,
          points: [pos.x, pos.y, pos.x, pos.y],
        };
        setShapes((s) => [...s, shape]);
      } else if (tool === 'text') {
        const value = window.prompt('Annotation text:');
        drawing.current = false;
        if (!value) return;
        const shape: AnnotationText = {
          id: nextId(),
          color,
          x: pos.x,
          y: pos.y,
          text: value,
          fontSize: 18,
        };
        setShapes((s) => [...s, shape]);
      }
    };

    const handleMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!drawing.current || !startPoint.current) return;
      const pos = getPos(e);

      setShapes((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const rest = prev.slice(0, -1);

        if ((tool === 'pen' || tool === 'highlight') && 'tool' in last && last.tool === tool) {
          return [
            ...rest,
            { ...last, points: [...last.points, pos.x, pos.y] },
          ];
        }
        if (tool === 'rect' && 'width' in last) {
          const r = last as AnnotationRect;
          return [
            ...rest,
            { ...r, width: pos.x - r.x, height: pos.y - r.y },
          ];
        }
        if (tool === 'arrow' && 'points' in last && (last as AnnotationArrow).points.length === 4) {
          const a = last as AnnotationArrow;
          return [
            ...rest,
            { ...a, points: [a.points[0], a.points[1], pos.x, pos.y] },
          ];
        }
        return prev;
      });
    };

    const handleUp = () => {
      drawing.current = false;
      startPoint.current = null;
    };

    if (!image) {
      return (
        <div
          style={{
            width: maxWidth,
            height: maxHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: 13,
          }}
        >
          Loading screenshot…
        </div>
      );
    }

    return (
      <Stage
        ref={stageRef}
        width={dims.width}
        height={dims.height}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
        style={{ cursor: tool === 'none' ? 'default' : 'crosshair', display: 'block' }}
      >
        <Layer listening={false}>
          <KonvaImage
            image={image}
            width={image.naturalWidth}
            height={image.naturalHeight}
            scaleX={dims.scale}
            scaleY={dims.scale}
          />
        </Layer>
        <Layer>
          {shapes.map((shape) => {
            if ('tool' in shape) {
              const s = shape as AnnotationLine;
              return (
                <Line
                  key={s.id}
                  points={s.points}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={s.tool === 'highlight' ? 'multiply' : 'source-over'}
                  opacity={s.tool === 'highlight' ? 0.4 : 1}
                />
              );
            }
            if ('width' in shape) {
              const r = shape as AnnotationRect;
              return (
                <Rect
                  key={r.id}
                  x={r.x}
                  y={r.y}
                  width={r.width}
                  height={r.height}
                  stroke={r.color}
                  strokeWidth={3}
                />
              );
            }
            if ('text' in shape) {
              const t = shape as AnnotationText;
              return (
                <Text
                  key={t.id}
                  x={t.x}
                  y={t.y}
                  text={t.text}
                  fontSize={t.fontSize}
                  fill={t.color}
                  fontStyle="bold"
                />
              );
            }
            const a = shape as AnnotationArrow;
            return (
              <Arrow
                key={a.id}
                points={a.points}
                stroke={a.color}
                fill={a.color}
                strokeWidth={3}
                pointerLength={12}
                pointerWidth={12}
              />
            );
          })}
        </Layer>
      </Stage>
    );
  },
);

AnnotationCanvas.displayName = 'AnnotationCanvas';
