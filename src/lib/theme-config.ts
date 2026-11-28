export interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  primaryRgb: string;
  secondaryRgb: string;
  shaderTint: [number, number, number, number];
  previewGradient: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "emerald-fusion",
    name: "Emerald Fusion",
    primary: "#00C987",
    secondary: "#9AF5C8",
    primaryRgb: "0, 201, 135",
    secondaryRgb: "154, 245, 200",
    shaderTint: [0.0, 0.788, 0.529, 0.9],
    previewGradient: "linear-gradient(135deg, #00C987 50%, #9AF5C8 50%)",
    description: "Protection & trusted zero-trust state",
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    primary: "#087DFF",
    secondary: "#42DFFF",
    primaryRgb: "8, 125, 255",
    secondaryRgb: "66, 223, 255",
    shaderTint: [0.031, 0.490, 1.0, 0.9],
    previewGradient: "linear-gradient(135deg, #087DFF 50%, #42DFFF 50%)",
    description: "Deep azure intelligence telemetry",
  },
  {
    id: "amber-forge",
    name: "Amber Forge",
    primary: "#E87525",
    secondary: "#F5C879",
    primaryRgb: "232, 117, 37",
    secondaryRgb: "245, 200, 121",
    shaderTint: [0.910, 0.459, 0.145, 0.9],
    previewGradient: "linear-gradient(135deg, #E87525 50%, #F5C879 50%)",
    description: "Industrial heat & vigilance alert",
  },
  {
    id: "ice-silver",
    name: "Ice Silver",
    primary: "#AABBD1",
    secondary: "#E5F5FF",
    primaryRgb: "170, 187, 209",
    secondaryRgb: "229, 245, 255",
    shaderTint: [0.667, 0.733, 0.820, 0.9],
    previewGradient: "linear-gradient(135deg, #AABBD1 50%, #E5F5FF 50%)",
    description: "Cryo-frost titanium precision",
  },
  {
    id: "cyber-teal",
    name: "Cyber Teal",
    primary: "#00AFAF",
    secondary: "#70F4E5",
    primaryRgb: "0, 175, 175",
    secondaryRgb: "112, 244, 229",
    shaderTint: [0.0, 0.686, 0.686, 0.9],
    previewGradient: "linear-gradient(135deg, #00AFAF 50%, #70F4E5 50%)",
    description: "Futuristic synthetic network grid",
  },
  {
    id: "neon-gold",
    name: "Neon Gold",
    primary: "#D9A600",
    secondary: "#FFE36B",
    primaryRgb: "217, 166, 0",
    secondaryRgb: "255, 227, 107",
    shaderTint: [0.851, 0.651, 0.0, 0.9],
    previewGradient: "linear-gradient(135deg, #D9A600 50%, #FFE36B 50%)",
    description: "High-value sovereign security",
  },
];

export const DEFAULT_THEME = THEMES[0];

export function getThemeById(id: string): ThemeOption {
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}
