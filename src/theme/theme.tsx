import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import { useMemo } from "react";
import componentsOverride from './overrides';
import palette from './palette';
import shadows, { customShadows } from './shadows';
import shape from './shape';
import typography from './typography';
export interface Props {

}

export default function ThemeConfig({ children }: React.PropsWithChildren<Props>) {
  const themeOptions = useMemo(
    () => ({
      palette,
      shape,
      typography,
      shadows,
      customShadows
    }),
    []
  );

  const theme = createTheme(themeOptions as any);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme} >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
