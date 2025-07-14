import * as d3Shape from 'd3-shape';
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const padding = 38;

type Point = { ageMonths: number; weight: number };

type Percentiles = {
  p3: Point[];
  p15: Point[];
  p50: Point[];
  p85: Point[];
  p97: Point[];
};

type Props = {
  patientWeights: Point[];
  gender: 'M' | 'F';
  boysPercentiles: Percentiles;
  girlsPercentiles: Percentiles;
  width?: number;
  height?: number;
  highlightPoint?: { ageMonths: number; weight: number }; // NEW
};

const maxAgeMonths = 60;
const maxWeight = 25;

const labelColors: Record<string, string> = {
  '3rd': '#222',
  '15th': '#222',
  '50th': '#e11d48', // red
  '85th': '#222',
  '97th': '#222',
};

const areaColors = {
  yellow: 'rgba(255, 237, 90, 0.19)',
  green: 'rgba(99, 232, 112, 0.19)',
};

const createAreaPath = (
  topPoints: Point[],
  bottomPoints: Point[],
  scaleX: (x: number) => number,
  scaleY: (y: number) => number
) => {
  if (!topPoints.length || !bottomPoints.length) return '';
  const allPoints = [...topPoints, ...bottomPoints.slice().reverse()];
  const path =
    d3Shape
      .line<Point>()
      .x(d => scaleX(d.ageMonths))
      .y(d => scaleY(d.weight))(allPoints) || '';
  return path + 'Z';
};

export default function Graph({
  patientWeights,
  gender,
  boysPercentiles,
  girlsPercentiles,
  width = 380,
  height = 450,
  highlightPoint,
}: Props) {
  const percentiles = gender === 'M' ? boysPercentiles : girlsPercentiles;

  const scaleX = (age: number) =>
    padding + (age / maxAgeMonths) * (width - padding * 2);
  const scaleY = (weight: number) =>
    height - padding - (weight / maxWeight) * (height - padding * 2);

  const createLinePath = (points: Point[]) =>
    d3Shape
      .line<Point>()
      .x(d => scaleX(d.ageMonths))
      .y(d => scaleY(d.weight))
      .curve(d3Shape.curveMonotoneX)(points) || '';

  // All lines black except 50th
  const percentilesWithLabels: { key: keyof Percentiles; label: string; stroke: string; width: number }[] = [
    { key: 'p3', label: '3rd', stroke: '#222', width: 1 },
    { key: 'p15', label: '15th', stroke: '#222', width: 1 },
    { key: 'p50', label: '50th', stroke: '#e11d48', width: 2 },
    { key: 'p85', label: '85th', stroke: '#222', width: 1 },
    { key: 'p97', label: '97th', stroke: '#222', width: 1 },
  ];

  // Y axis major ticks
  const yTicksMajor = [];
  for (let i = 0; i <= maxWeight; i++) yTicksMajor.push(i);

  // X axis ticks (major years)
  const xTicksMajor = [];
  for (let i = 0; i <= 5; i++) xTicksMajor.push(i);

  // X axis minor ticks (months)
  const xTicksMinor = [];
  for (let i = 0; i < maxAgeMonths; i++) xTicksMinor.push(i);

  return (
    <View style={{ backgroundColor: '#f5f6fa' }}>
      <Svg width={width} height={height}>

        {/* --- SHADED REGIONS --- */}
        {/* 97th–85th: yellow */}
        <Path
          d={createAreaPath(percentiles.p97, percentiles.p85, scaleX, scaleY)}
          fill={areaColors.yellow}
          stroke="none"
        />
        {/* 85th–50th: green */}
        <Path
          d={createAreaPath(percentiles.p85, percentiles.p50, scaleX, scaleY)}
          fill={areaColors.green}
          stroke="none"
        />
        {/* 50th–15th: green */}
        <Path
          d={createAreaPath(percentiles.p50, percentiles.p15, scaleX, scaleY)}
          fill={areaColors.green}
          stroke="none"
        />
        {/* 15th–3rd: yellow */}
        <Path
          d={createAreaPath(percentiles.p15, percentiles.p3, scaleX, scaleY)}
          fill={areaColors.yellow}
          stroke="none"
        />

        {/* Y axis lines and labels (major ticks) */}
        {yTicksMajor.map((wt) => {
          const y = scaleY(wt);
          return (
            <React.Fragment key={`y-tick-${wt}`}>
              <Line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#ddd"
                strokeWidth={wt === 0 ? 2 : 1}
              />
              {wt > 0 && (
                <SvgText
                  x={padding - 6}
                  y={y + 3}
                  fontSize={10}
                  fill="#555"
                  textAnchor="end"
                  alignmentBaseline="middle"
                >
                  {wt}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}

        {/* X axis minor ticks (months) */}
        {xTicksMinor.map((m) => {
          const x = scaleX(m);
          return (
            <Line
              key={`x-tick-minor-${m}`}
              x1={x}
              y1={height - padding}
              x2={x}
              y2={height - padding + 5}
              stroke="#bbb"
              strokeWidth={0.7}
            />
          );
        })}

        {/* X axis major ticks (years) */}
        {xTicksMajor.map((yr) => {
          const x = scaleX(yr * 12);
          return (
            <React.Fragment key={`x-tick-major-${yr}`}>
              <Line
                x1={x}
                y1={height - padding}
                x2={x}
                y2={height - padding + 9}
                stroke="#444"
                strokeWidth={1.5}
              />
              <SvgText
                x={x}
                y={height - padding + 19}
                fontSize={11}
                fill="#444"
                textAnchor="middle"
              >
                {yr}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Axis Labels */}
        <SvgText
          x={width / 2}
          y={height - 6}
          fontSize={12}
          fill="#333"
          textAnchor="middle"
          fontWeight="600"
        >
          Age (years)
        </SvgText>

        <SvgText
          x={padding - 22}
          y={height / 2}
          fontSize={12}
          fill="#333"
          textAnchor="middle"
          fontWeight="600"
          transform={`rotate(-90, ${padding - 22}, ${height / 2})`}
        >
          Weight (kg)
        </SvgText>

        {/* Percentile lines and close labels */}
        {percentilesWithLabels.map(({ key, label, stroke, width: strokeWidth }) => {
          const points = percentiles[key];
          if (!points || points.length === 0) return null;
          const end = points[points.length - 1];
          return (
            <React.Fragment key={key}>
              <Path d={createLinePath(points)} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
              <SvgText
                x={scaleX(end.ageMonths) - 2}
                y={scaleY(end.weight) + 1}
                fontSize={11}
                fill={labelColors[label] || stroke}
                fontWeight={key === 'p50' ? '700' : '600'}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Patient weight points */}
        {patientWeights.map(({ ageMonths, weight }, i) => (
          <Circle
            key={i}
            cx={scaleX(ageMonths)}
            cy={scaleY(weight)}
            r={4}
            fill="#100400"
            stroke="#fff"
            strokeWidth={1}
          />
        ))}

        {/* Highlight new (red) point if provided */}
        {highlightPoint && (
          <Circle
            cx={scaleX(highlightPoint.ageMonths)}
            cy={scaleY(highlightPoint.weight)}
            r={7}
            fill="#e11d48"
            stroke="#fff"
            strokeWidth={2}
          />
        )}

        {/* Connect patient weight points */}
        {patientWeights.length > 1 && (
          <Path d={createLinePath(patientWeights)} stroke="#100400" strokeWidth={2} fill="none" />
        )}
      </Svg>
    </View>
  );
}

export const boysPercentiles = {
  p3: [
    { ageMonths: 0, weight: 2.5 }, { ageMonths: 1, weight: 3.4 }, { ageMonths: 2, weight: 4.4 },
    { ageMonths: 3, weight: 5.1 }, { ageMonths: 4, weight: 5.6 }, { ageMonths: 5, weight: 6.1 },
    { ageMonths: 6, weight: 6.4 }, { ageMonths: 7, weight: 6.7 }, { ageMonths: 8, weight: 7.0 },
    { ageMonths: 9, weight: 7.2 }, { ageMonths: 10, weight: 7.5 }, { ageMonths: 11, weight: 7.7 },
    { ageMonths: 12, weight: 7.8 }, { ageMonths: 13, weight: 8.0 }, { ageMonths: 14, weight: 8.2 },
    { ageMonths: 15, weight: 8.4 }, { ageMonths: 16, weight: 8.5 }, { ageMonths: 17, weight: 8.7 },
    { ageMonths: 18, weight: 8.9 }, { ageMonths: 19, weight: 9.0 }, { ageMonths: 20, weight: 9.2 },
    { ageMonths: 21, weight: 9.3 }, { ageMonths: 22, weight: 9.5 }, { ageMonths: 23, weight: 9.7 },
    { ageMonths: 24, weight: 9.8 }, { ageMonths: 25, weight: 10.0 }, { ageMonths: 26, weight: 10.1 },
    { ageMonths: 27, weight: 10.2 }, { ageMonths: 28, weight: 10.4 }, { ageMonths: 29, weight: 10.5 },
    { ageMonths: 30, weight: 10.7 }, { ageMonths: 31, weight: 10.8 }, { ageMonths: 32, weight: 10.9 },
    { ageMonths: 33, weight: 11.1 }, { ageMonths: 34, weight: 11.2 }, { ageMonths: 35, weight: 11.3 },
    { ageMonths: 36, weight: 11.4 }, { ageMonths: 37, weight: 11.6 }, { ageMonths: 38, weight: 11.7 },
    { ageMonths: 39, weight: 11.8 }, { ageMonths: 40, weight: 11.9 }, { ageMonths: 41, weight: 12.1 },
    { ageMonths: 42, weight: 12.2 }, { ageMonths: 43, weight: 12.3 }, { ageMonths: 44, weight: 12.4 },
    { ageMonths: 45, weight: 12.5 }, { ageMonths: 46, weight: 12.7 }, { ageMonths: 47, weight: 12.8 },
    { ageMonths: 48, weight: 12.9 }, { ageMonths: 49, weight: 13.0 }, { ageMonths: 50, weight: 13.1 },
    { ageMonths: 51, weight: 13.3 }, { ageMonths: 52, weight: 13.4 }, { ageMonths: 53, weight: 13.5 },
    { ageMonths: 54, weight: 13.6 }, { ageMonths: 55, weight: 13.7 }, { ageMonths: 56, weight: 13.8 },
    { ageMonths: 57, weight: 13.9 }, { ageMonths: 58, weight: 14.1 }, { ageMonths: 59, weight: 14.2 },
    { ageMonths: 60, weight: 14.3 }
  ],
  p15: [
    { ageMonths: 0, weight: 2.9 }, { ageMonths: 1, weight: 3.9 }, { ageMonths: 2, weight: 4.9 },
    { ageMonths: 3, weight: 5.6 }, { ageMonths: 4, weight: 6.2 }, { ageMonths: 5, weight: 6.7 },
    { ageMonths: 6, weight: 7.1 }, { ageMonths: 7, weight: 7.4 }, { ageMonths: 8, weight: 7.7 },
    { ageMonths: 9, weight: 7.9 }, { ageMonths: 10, weight: 8.2 }, { ageMonths: 11, weight: 8.4 },
    { ageMonths: 12, weight: 8.6 }, { ageMonths: 13, weight: 8.8 }, { ageMonths: 14, weight: 9.0 },
    { ageMonths: 15, weight: 9.2 }, { ageMonths: 16, weight: 9.4 }, { ageMonths: 17, weight: 9.6 },
    { ageMonths: 18, weight: 9.7 }, { ageMonths: 19, weight: 9.9 }, { ageMonths: 20, weight: 10.1 },
    { ageMonths: 21, weight: 10.3 }, { ageMonths: 22, weight: 10.5 }, { ageMonths: 23, weight: 10.7 },
    { ageMonths: 24, weight: 10.9 }, { ageMonths: 25, weight: 11.0 }, { ageMonths: 26, weight: 11.2 },
    { ageMonths: 27, weight: 11.4 }, { ageMonths: 28, weight: 11.5 }, { ageMonths: 29, weight: 11.7 },
    { ageMonths: 30, weight: 11.8 }, { ageMonths: 31, weight: 12.0 }, { ageMonths: 32, weight: 12.1 },
    { ageMonths: 33, weight: 12.3 }, { ageMonths: 34, weight: 12.4 }, { ageMonths: 35, weight: 12.6 },
    { ageMonths: 36, weight: 12.7 }, { ageMonths: 37, weight: 12.9 }, { ageMonths: 38, weight: 13.0 },
    { ageMonths: 39, weight: 13.2 }, { ageMonths: 40, weight: 13.3 }, { ageMonths: 41, weight: 13.5 },
    { ageMonths: 42, weight: 13.6 }, { ageMonths: 43, weight: 13.7 }, { ageMonths: 44, weight: 13.9 },
    { ageMonths: 45, weight: 14.0 }, { ageMonths: 46, weight: 14.2 }, { ageMonths: 47, weight: 14.3 },
    { ageMonths: 48, weight: 14.4 }, { ageMonths: 49, weight: 14.6 }, { ageMonths: 50, weight: 14.7 },
    { ageMonths: 51, weight: 14.9 }, { ageMonths: 52, weight: 15.0 }, { ageMonths: 53, weight: 15.1 },
    { ageMonths: 54, weight: 15.3 }, { ageMonths: 55, weight: 15.4 }, { ageMonths: 56, weight: 15.5 },
    { ageMonths: 57, weight: 15.7 }, { ageMonths: 58, weight: 15.8 }, { ageMonths: 59, weight: 16.0 },
    { ageMonths: 60, weight: 16.1 }
  ],
  p50: [
    { ageMonths: 0, weight: 3.3 }, { ageMonths: 1, weight: 4.5 }, { ageMonths: 2, weight: 5.6 },
    { ageMonths: 3, weight: 6.4 }, { ageMonths: 4, weight: 7.0 }, { ageMonths: 5, weight: 7.5 },
    { ageMonths: 6, weight: 7.9 }, { ageMonths: 7, weight: 8.3 }, { ageMonths: 8, weight: 8.6 },
    { ageMonths: 9, weight: 8.9 }, { ageMonths: 10, weight: 9.2 }, { ageMonths: 11, weight: 9.4 },
    { ageMonths: 12, weight: 9.6 }, { ageMonths: 13, weight: 9.9 }, { ageMonths: 14, weight: 10.1 },
    { ageMonths: 15, weight: 10.3 }, { ageMonths: 16, weight: 10.5 }, { ageMonths: 17, weight: 10.7 },
    { ageMonths: 18, weight: 10.9 }, { ageMonths: 19, weight: 11.1 }, { ageMonths: 20, weight: 11.3 },
    { ageMonths: 21, weight: 11.5 }, { ageMonths: 22, weight: 11.8 }, { ageMonths: 23, weight: 12.0 },
    { ageMonths: 24, weight: 12.2 }, { ageMonths: 25, weight: 12.4 }, { ageMonths: 26, weight: 12.5 },
    { ageMonths: 27, weight: 12.7 }, { ageMonths: 28, weight: 12.9 }, { ageMonths: 29, weight: 13.1 },
    { ageMonths: 30, weight: 13.3 }, { ageMonths: 31, weight: 13.5 }, { ageMonths: 32, weight: 13.7 },
    { ageMonths: 33, weight: 13.8 }, { ageMonths: 34, weight: 14.0 }, { ageMonths: 35, weight: 14.2 },
    { ageMonths: 36, weight: 14.3 }, { ageMonths: 37, weight: 14.5 }, { ageMonths: 38, weight: 14.7 },
    { ageMonths: 39, weight: 14.8 }, { ageMonths: 40, weight: 15.0 }, { ageMonths: 41, weight: 15.2 },
    { ageMonths: 42, weight: 15.3 }, { ageMonths: 43, weight: 15.5 }, { ageMonths: 44, weight: 15.7 },
    { ageMonths: 45, weight: 15.8 }, { ageMonths: 46, weight: 16.0 }, { ageMonths: 47, weight: 16.2 },
    { ageMonths: 48, weight: 16.3 }, { ageMonths: 49, weight: 16.5 }, { ageMonths: 50, weight: 16.7 },
    { ageMonths: 51, weight: 16.8 }, { ageMonths: 52, weight: 17.0 }, { ageMonths: 53, weight: 17.2 },
    { ageMonths: 54, weight: 17.3 }, { ageMonths: 55, weight: 17.5 }, { ageMonths: 56, weight: 17.7 },
    { ageMonths: 57, weight: 17.8 }, { ageMonths: 58, weight: 18.0 }, { ageMonths: 59, weight: 18.2 },
    { ageMonths: 60, weight: 18.3 }
  ],
  p85: [
    { ageMonths: 0, weight: 3.9 }, { ageMonths: 1, weight: 5.1 }, { ageMonths: 2, weight: 6.3 },
    { ageMonths: 3, weight: 7.2 }, { ageMonths: 4, weight: 7.9 }, { ageMonths: 5, weight: 8.5 },
    { ageMonths: 6, weight: 8.9 }, { ageMonths: 7, weight: 9.3 }, { ageMonths: 8, weight: 9.6 },
    { ageMonths: 9, weight: 9.9 }, { ageMonths: 10, weight: 10.2 }, { ageMonths: 11, weight: 10.5 },
    { ageMonths: 12, weight: 10.7 }, { ageMonths: 13, weight: 11.0 }, { ageMonths: 14, weight: 11.2 },
    { ageMonths: 15, weight: 11.4 }, { ageMonths: 16, weight: 11.7 }, { ageMonths: 17, weight: 11.9 },
    { ageMonths: 18, weight: 12.2 }, { ageMonths: 19, weight: 12.4 }, { ageMonths: 20, weight: 12.6 },
    { ageMonths: 21, weight: 12.9 }, { ageMonths: 22, weight: 13.1 }, { ageMonths: 23, weight: 13.4 },
    { ageMonths: 24, weight: 13.6 }, { ageMonths: 25, weight: 13.9 }, { ageMonths: 26, weight: 14.1 },
    { ageMonths: 27, weight: 14.4 }, { ageMonths: 28, weight: 14.6 }, { ageMonths: 29, weight: 14.8 },
    { ageMonths: 30, weight: 15.1 }, { ageMonths: 31, weight: 15.3 }, { ageMonths: 32, weight: 15.5 },
    { ageMonths: 33, weight: 15.7 }, { ageMonths: 34, weight: 16.0 }, { ageMonths: 35, weight: 16.2 },
    { ageMonths: 36, weight: 16.4 }, { ageMonths: 37, weight: 16.6 }, { ageMonths: 38, weight: 16.8 },
    { ageMonths: 39, weight: 17.0 }, { ageMonths: 40, weight: 17.3 }, { ageMonths: 41, weight: 17.5 },
    { ageMonths: 42, weight: 17.7 }, { ageMonths: 43, weight: 17.9 }, { ageMonths: 44, weight: 18.1 },
    { ageMonths: 45, weight: 18.3 }, { ageMonths: 46, weight: 18.6 }, { ageMonths: 47, weight: 18.8 },
    { ageMonths: 48, weight: 19.0 }, { ageMonths: 49, weight: 19.2 }, { ageMonths: 50, weight: 19.4 },
    { ageMonths: 51, weight: 19.7 }, { ageMonths: 52, weight: 19.9 }, { ageMonths: 53, weight: 20.1 },
    { ageMonths: 54, weight: 20.3 }, { ageMonths: 55, weight: 20.6 }, { ageMonths: 56, weight: 20.8 },
    { ageMonths: 57, weight: 21.0 }, { ageMonths: 58, weight: 21.2 }, { ageMonths: 59, weight: 21.4 },
    { ageMonths: 60, weight: 21.6 }
  ],
  p97: [
    { ageMonths: 0, weight: 4.3 }, { ageMonths: 1, weight: 5.7 }, { ageMonths: 2, weight: 7.0 },
    { ageMonths: 3, weight: 7.9 }, { ageMonths: 4, weight: 8.6 }, { ageMonths: 5, weight: 9.1 },
    { ageMonths: 6, weight: 9.6 }, { ageMonths: 7, weight: 10.1 }, { ageMonths: 8, weight: 10.5 },
    { ageMonths: 9, weight: 10.9 }, { ageMonths: 10, weight: 11.3 }, { ageMonths: 11, weight: 11.6 },
    { ageMonths: 12, weight: 11.9 }, { ageMonths: 13, weight: 12.2 }, { ageMonths: 14, weight: 12.5 },
    { ageMonths: 15, weight: 12.8 }, { ageMonths: 16, weight: 13.0 }, { ageMonths: 17, weight: 13.3 },
    { ageMonths: 18, weight: 13.5 }, { ageMonths: 19, weight: 13.8 }, { ageMonths: 20, weight: 14.0 },
    { ageMonths: 21, weight: 14.3 }, { ageMonths: 22, weight: 14.6 }, { ageMonths: 23, weight: 14.9 },
    { ageMonths: 24, weight: 15.1 }, { ageMonths: 25, weight: 15.4 }, { ageMonths: 26, weight: 15.7 },
    { ageMonths: 27, weight: 15.9 }, { ageMonths: 28, weight: 16.2 }, { ageMonths: 29, weight: 16.5 },
    { ageMonths: 30, weight: 16.7 }, { ageMonths: 31, weight: 17.0 }, { ageMonths: 32, weight: 17.3 },
    { ageMonths: 33, weight: 17.6 }, { ageMonths: 34, weight: 17.8 }, { ageMonths: 35, weight: 18.1 },
    { ageMonths: 36, weight: 18.3 }, { ageMonths: 37, weight: 18.6 }, { ageMonths: 38, weight: 18.9 },
    { ageMonths: 39, weight: 19.1 }, { ageMonths: 40, weight: 19.4 }, { ageMonths: 41, weight: 19.7 },
    { ageMonths: 42, weight: 19.9 }, { ageMonths: 43, weight: 20.2 }, { ageMonths: 44, weight: 20.5 },
    { ageMonths: 45, weight: 20.7 }, { ageMonths: 46, weight: 21.0 }, { ageMonths: 47, weight: 21.3 },
    { ageMonths: 48, weight: 21.5 }, { ageMonths: 49, weight: 21.8 }, { ageMonths: 50, weight: 22.1 },
    { ageMonths: 51, weight: 22.3 }, { ageMonths: 52, weight: 22.6 }, { ageMonths: 53, weight: 22.9 },
    { ageMonths: 54, weight: 23.1 }, { ageMonths: 55, weight: 23.4 }, { ageMonths: 56, weight: 23.7 },
    { ageMonths: 57, weight: 23.9 }, { ageMonths: 58, weight: 24.2 }, { ageMonths: 59, weight: 24.5 },
    { ageMonths: 60, weight: 24.8 }
  ]
};

export const girlsPercentiles = {
  p3: [
    { ageMonths: 0, weight: 2.4 }, { ageMonths: 1, weight: 3.2 }, { ageMonths: 2, weight: 4.0 },
    { ageMonths: 3, weight: 4.6 }, { ageMonths: 4, weight: 5.1 }, { ageMonths: 5, weight: 5.5 },
    { ageMonths: 6, weight: 5.8 }, { ageMonths: 7, weight: 6.1 }, { ageMonths: 8, weight: 6.3 },
    { ageMonths: 9, weight: 6.6 }, { ageMonths: 10, weight: 6.8 }, { ageMonths: 11, weight: 7.0 },
    { ageMonths: 12, weight: 7.2 }, { ageMonths: 13, weight: 7.4 }, { ageMonths: 14, weight: 7.6 },
    { ageMonths: 15, weight: 7.8 }, { ageMonths: 16, weight: 7.9 }, { ageMonths: 17, weight: 8.1 },
    { ageMonths: 18, weight: 8.2 }, { ageMonths: 19, weight: 8.4 }, { ageMonths: 20, weight: 8.5 },
    { ageMonths: 21, weight: 8.6 }, { ageMonths: 22, weight: 8.8 }, { ageMonths: 23, weight: 8.9 },
    { ageMonths: 24, weight: 9.0 }, { ageMonths: 25, weight: 9.2 }, { ageMonths: 26, weight: 9.3 },
    { ageMonths: 27, weight: 9.4 }, { ageMonths: 28, weight: 9.6 }, { ageMonths: 29, weight: 9.7 },
    { ageMonths: 30, weight: 9.8 }, { ageMonths: 31, weight: 10.0 }, { ageMonths: 32, weight: 10.1 },
    { ageMonths: 33, weight: 10.2 }, { ageMonths: 34, weight: 10.4 }, { ageMonths: 35, weight: 10.5 },
    { ageMonths: 36, weight: 10.6 }, { ageMonths: 37, weight: 10.8 }, { ageMonths: 38, weight: 10.9 },
    { ageMonths: 39, weight: 11.0 }, { ageMonths: 40, weight: 11.1 }, { ageMonths: 41, weight: 11.3 },
    { ageMonths: 42, weight: 11.4 }, { ageMonths: 43, weight: 11.5 }, { ageMonths: 44, weight: 11.6 },
    { ageMonths: 45, weight: 11.7 }, { ageMonths: 46, weight: 11.8 }, { ageMonths: 47, weight: 12.0 },
    { ageMonths: 48, weight: 12.1 }, { ageMonths: 49, weight: 12.2 }, { ageMonths: 50, weight: 12.3 },
    { ageMonths: 51, weight: 12.4 }, { ageMonths: 52, weight: 12.6 }, { ageMonths: 53, weight: 12.7 },
    { ageMonths: 54, weight: 12.8 }, { ageMonths: 55, weight: 12.9 }, { ageMonths: 56, weight: 13.0 },
    { ageMonths: 57, weight: 13.2 }, { ageMonths: 58, weight: 13.3 }, { ageMonths: 59, weight: 13.4 },
    { ageMonths: 60, weight: 13.5 }
  ],
  p15: [
    { ageMonths: 0, weight: 2.8 }, { ageMonths: 1, weight: 3.6 }, { ageMonths: 2, weight: 4.5 },
    { ageMonths: 3, weight: 5.1 }, { ageMonths: 4, weight: 5.6 }, { ageMonths: 5, weight: 6.0 },
    { ageMonths: 6, weight: 6.4 }, { ageMonths: 7, weight: 6.7 }, { ageMonths: 8, weight: 7.0 },
    { ageMonths: 9, weight: 7.2 }, { ageMonths: 10, weight: 7.5 }, { ageMonths: 11, weight: 7.7 },
    { ageMonths: 12, weight: 7.9 }, { ageMonths: 13, weight: 8.1 }, { ageMonths: 14, weight: 8.3 },
    { ageMonths: 15, weight: 8.5 }, { ageMonths: 16, weight: 8.7 }, { ageMonths: 17, weight: 8.9 },
    { ageMonths: 18, weight: 9.0 }, { ageMonths: 19, weight: 9.2 }, { ageMonths: 20, weight: 9.4 },
    { ageMonths: 21, weight: 9.5 }, { ageMonths: 22, weight: 9.7 }, { ageMonths: 23, weight: 9.8 },
    { ageMonths: 24, weight: 10.0 }, { ageMonths: 25, weight: 10.1 }, { ageMonths: 26, weight: 10.3 },
    { ageMonths: 27, weight: 10.4 }, { ageMonths: 28, weight: 10.6 }, { ageMonths: 29, weight: 10.7 },
    { ageMonths: 30, weight: 10.9 }, { ageMonths: 31, weight: 11.0 }, { ageMonths: 32, weight: 11.1 },
    { ageMonths: 33, weight: 11.3 }, { ageMonths: 34, weight: 11.4 }, { ageMonths: 35, weight: 11.5 },
    { ageMonths: 36, weight: 11.7 }, { ageMonths: 37, weight: 11.8 }, { ageMonths: 38, weight: 12.0 },
    { ageMonths: 39, weight: 12.1 }, { ageMonths: 40, weight: 12.2 }, { ageMonths: 41, weight: 12.3 },
    { ageMonths: 42, weight: 12.5 }, { ageMonths: 43, weight: 12.6 }, { ageMonths: 44, weight: 12.7 },
    { ageMonths: 45, weight: 12.9 }, { ageMonths: 46, weight: 13.0 }, { ageMonths: 47, weight: 13.1 },
    { ageMonths: 48, weight: 13.2 }, { ageMonths: 49, weight: 13.4 }, { ageMonths: 50, weight: 13.5 },
    { ageMonths: 51, weight: 13.6 }, { ageMonths: 52, weight: 13.7 }, { ageMonths: 53, weight: 13.9 },
    { ageMonths: 54, weight: 14.0 }, { ageMonths: 55, weight: 14.1 }, { ageMonths: 56, weight: 14.3 },
    { ageMonths: 57, weight: 14.4 }, { ageMonths: 58, weight: 14.5 }, { ageMonths: 59, weight: 14.6 },
    { ageMonths: 60, weight: 14.8 }
  ],
  p50: [
    { ageMonths: 0, weight: 3.2 }, { ageMonths: 1, weight: 4.2 }, { ageMonths: 2, weight: 5.1 },
    { ageMonths: 3, weight: 5.8 }, { ageMonths: 4, weight: 6.4 }, { ageMonths: 5, weight: 6.9 },
    { ageMonths: 6, weight: 7.3 }, { ageMonths: 7, weight: 7.6 }, { ageMonths: 8, weight: 7.9 },
    { ageMonths: 9, weight: 8.2 }, { ageMonths: 10, weight: 8.5 }, { ageMonths: 11, weight: 8.7 },
    { ageMonths: 12, weight: 8.9 }, { ageMonths: 13, weight: 9.1 }, { ageMonths: 14, weight: 9.4 },
    { ageMonths: 15, weight: 9.6 }, { ageMonths: 16, weight: 9.8 }, { ageMonths: 17, weight: 10.0 },
    { ageMonths: 18, weight: 10.2 }, { ageMonths: 19, weight: 10.3 }, { ageMonths: 20, weight: 10.5 },
    { ageMonths: 21, weight: 10.7 }, { ageMonths: 22, weight: 10.9 }, { ageMonths: 23, weight: 11.1 },
    { ageMonths: 24, weight: 11.3 }, { ageMonths: 25, weight: 11.4 }, { ageMonths: 26, weight: 11.6 },
    { ageMonths: 27, weight: 11.8 }, { ageMonths: 28, weight: 12.0 }, { ageMonths: 29, weight: 12.1 },
    { ageMonths: 30, weight: 12.3 }, { ageMonths: 31, weight: 12.4 }, { ageMonths: 32, weight: 12.6 },
    { ageMonths: 33, weight: 12.7 }, { ageMonths: 34, weight: 12.9 }, { ageMonths: 35, weight: 13.0 },
    { ageMonths: 36, weight: 13.2 }, { ageMonths: 37, weight: 13.4 }, { ageMonths: 38, weight: 13.5 },
    { ageMonths: 39, weight: 13.7 }, { ageMonths: 40, weight: 13.8 }, { ageMonths: 41, weight: 13.9 },
    { ageMonths: 42, weight: 14.1 }, { ageMonths: 43, weight: 14.2 }, { ageMonths: 44, weight: 14.4 },
    { ageMonths: 45, weight: 14.5 }, { ageMonths: 46, weight: 14.7 }, { ageMonths: 47, weight: 14.8 },
    { ageMonths: 48, weight: 14.9 }, { ageMonths: 49, weight: 15.1 }, { ageMonths: 50, weight: 15.2 },
    { ageMonths: 51, weight: 15.3 }, { ageMonths: 52, weight: 15.4 }, { ageMonths: 53, weight: 15.6 },
    { ageMonths: 54, weight: 15.7 }, { ageMonths: 55, weight: 15.9 }, { ageMonths: 56, weight: 16.0 },
    { ageMonths: 57, weight: 16.2 }, { ageMonths: 58, weight: 16.3 }, { ageMonths: 59, weight: 16.5 },
    { ageMonths: 60, weight: 16.7 }
  ],
  p85: [
    { ageMonths: 0, weight: 3.7 }, { ageMonths: 1, weight: 4.8 }, { ageMonths: 2, weight: 5.9 },
    { ageMonths: 3, weight: 6.7 }, { ageMonths: 4, weight: 7.3 }, { ageMonths: 5, weight: 7.9 },
    { ageMonths: 6, weight: 8.3 }, { ageMonths: 7, weight: 8.7 }, { ageMonths: 8, weight: 9.0 },
    { ageMonths: 9, weight: 9.3 }, { ageMonths: 10, weight: 9.6 }, { ageMonths: 11, weight: 9.9 },
    { ageMonths: 12, weight: 10.1 }, { ageMonths: 13, weight: 10.4 }, { ageMonths: 14, weight: 10.7 },
    { ageMonths: 15, weight: 10.9 }, { ageMonths: 16, weight: 11.1 }, { ageMonths: 17, weight: 11.4 },
    { ageMonths: 18, weight: 11.6 }, { ageMonths: 19, weight: 11.8 }, { ageMonths: 20, weight: 12.0 },
    { ageMonths: 21, weight: 12.3 }, { ageMonths: 22, weight: 12.5 }, { ageMonths: 23, weight: 12.7 },
    { ageMonths: 24, weight: 12.9 }, { ageMonths: 25, weight: 13.1 }, { ageMonths: 26, weight: 13.4 },
    { ageMonths: 27, weight: 13.6 }, { ageMonths: 28, weight: 13.8 }, { ageMonths: 29, weight: 14.0 },
    { ageMonths: 30, weight: 14.2 }, { ageMonths: 31, weight: 14.4 }, { ageMonths: 32, weight: 14.6 },
    { ageMonths: 33, weight: 14.8 }, { ageMonths: 34, weight: 15.1 }, { ageMonths: 35, weight: 15.3 },
    { ageMonths: 36, weight: 15.5 }, { ageMonths: 37, weight: 15.7 }, { ageMonths: 38, weight: 15.9 },
    { ageMonths: 39, weight: 16.1 }, { ageMonths: 40, weight: 16.4 }, { ageMonths: 41, weight: 16.6 },
    { ageMonths: 42, weight: 16.8 }, { ageMonths: 43, weight: 17.0 }, { ageMonths: 44, weight: 17.2 },
    { ageMonths: 45, weight: 17.4 }, { ageMonths: 46, weight: 17.6 }, { ageMonths: 47, weight: 17.8 },
    { ageMonths: 48, weight: 18.0 }, { ageMonths: 49, weight: 18.2 }, { ageMonths: 50, weight: 18.4 },
    { ageMonths: 51, weight: 18.6 }, { ageMonths: 52, weight: 18.8 }, { ageMonths: 53, weight: 19.0 },
    { ageMonths: 54, weight: 19.2 }, { ageMonths: 55, weight: 19.4 }, { ageMonths: 56, weight: 19.6 },
    { ageMonths: 57, weight: 19.8 }, { ageMonths: 58, weight: 20.0 }, { ageMonths: 59, weight: 20.2 },
    { ageMonths: 60, weight: 20.4 }
  ],
  p97: [
    { ageMonths: 0, weight: 4.2 }, { ageMonths: 1, weight: 5.4 }, { ageMonths: 2, weight: 6.5 },
    { ageMonths: 3, weight: 7.4 }, { ageMonths: 4, weight: 8.1 }, { ageMonths: 5, weight: 8.6 },
    { ageMonths: 6, weight: 9.1 }, { ageMonths: 7, weight: 9.5 }, { ageMonths: 8, weight: 9.9 },
    { ageMonths: 9, weight: 10.2 }, { ageMonths: 10, weight: 10.6 }, { ageMonths: 11, weight: 10.9 },
    { ageMonths: 12, weight: 11.2 }, { ageMonths: 13, weight: 11.5 }, { ageMonths: 14, weight: 11.8 },
    { ageMonths: 15, weight: 12.1 }, { ageMonths: 16, weight: 12.3 }, { ageMonths: 17, weight: 12.6 },
    { ageMonths: 18, weight: 12.9 }, { ageMonths: 19, weight: 13.1 }, { ageMonths: 20, weight: 13.4 },
    { ageMonths: 21, weight: 13.6 }, { ageMonths: 22, weight: 13.9 }, { ageMonths: 23, weight: 14.2 },
    { ageMonths: 24, weight: 14.4 }, { ageMonths: 25, weight: 14.7 }, { ageMonths: 26, weight: 14.9 },
    { ageMonths: 27, weight: 15.2 }, { ageMonths: 28, weight: 15.5 }, { ageMonths: 29, weight: 15.7 },
    { ageMonths: 30, weight: 16.0 }, { ageMonths: 31, weight: 16.3 }, { ageMonths: 32, weight: 16.5 },
    { ageMonths: 33, weight: 16.8 }, { ageMonths: 34, weight: 17.1 }, { ageMonths: 35, weight: 17.3 },
    { ageMonths: 36, weight: 17.6 }, { ageMonths: 37, weight: 17.8 }, { ageMonths: 38, weight: 18.1 },
    { ageMonths: 39, weight: 18.4 }, { ageMonths: 40, weight: 18.7 }, { ageMonths: 41, weight: 19.0 },
    { ageMonths: 42, weight: 19.2 }, { ageMonths: 43, weight: 19.5 }, { ageMonths: 44, weight: 19.8 },
    { ageMonths: 45, weight: 20.1 }, { ageMonths: 46, weight: 20.3 }, { ageMonths: 47, weight: 20.6 },
    { ageMonths: 48, weight: 20.9 }, { ageMonths: 49, weight: 21.2 }, { ageMonths: 50, weight: 21.4 },
    { ageMonths: 51, weight: 21.7 }, { ageMonths: 52, weight: 22.0 }, { ageMonths: 53, weight: 22.2 },
    { ageMonths: 54, weight: 22.5 }, { ageMonths: 55, weight: 22.8 }, { ageMonths: 56, weight: 23.1 },
    { ageMonths: 57, weight: 23.4 }, { ageMonths: 58, weight: 23.7 }, { ageMonths: 59, weight: 24.0 },
    { ageMonths: 60, weight: 24.2 }
  ]
};