import React from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Tabs, 
  Tab, 
  Typography, 
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { Close } from '@mui/icons-material';

const symbols = {
  basic: [
    { label: '+', latex: '+' },
    { label: '-', latex: '-' },
    { label: '×', latex: '\\times' },
    { label: '÷', latex: '\\div' },
    { label: '=', latex: '=' },
    { label: '±', latex: '\\pm' },
    { label: '≈', latex: '\\approx' },
    { label: '≠', latex: '\\neq' },
    { label: '(', latex: '(' },
    { label: ')', latex: ')' },
    { label: '[', latex: '[' },
    { label: ']', latex: ']' },
  ],
  greek: [
    { label: 'α', latex: '\\alpha' },
    { label: 'β', latex: '\\beta' },
    { label: 'γ', latex: '\\gamma' },
    { label: 'δ', latex: '\\delta' },
    { label: 'θ', latex: '\\theta' },
    { label: 'π', latex: '\\pi' },
    { label: 'Σ', latex: '\\sum' },
    { label: 'Δ', latex: '\\Delta' },
    { label: 'λ', latex: '\\lambda' },
    { label: 'σ', latex: '\\sigma' },
    { label: 'Ω', latex: '\\Omega' },
    { label: 'μ', latex: '\\mu' },
  ],
  relations: [
    { label: '<', latex: '<' },
    { label: '>', latex: '>' },
    { label: '≤', latex: '\\leq' },
    { label: '≥', latex: '\\geq' },
    { label: '≡', latex: '\\equiv' },
    { label: '∈', latex: '\\in' },
    { label: '∉', latex: '\\notin' },
    { label: '≈', latex: '\\approx' },
    { label: '∝', latex: '\\propto' },
    { label: '∞', latex: '\\infty' },
  ],
  advanced: [
    { label: '√x', latex: '\\sqrt{}' },
    { label: 'xⁿ', latex: '^{}' },
    { label: 'xₙ', latex: '_{}' },
    { label: 'a/b', latex: '\\frac{}{}' },
    { label: '∫', latex: '\\int' },
    { label: 'lim', latex: '\\lim_{x \\to 0}' },
    { label: '∂', latex: '\\partial' },
    { label: '∇', latex: '\\nabla' },
    { label: 'log', latex: '\\log' },
    { label: 'sin', latex: '\\sin' },
    { label: 'cos', latex: '\\cos' },
    { label: 'tan', latex: '\\tan' },
  ]
};

const MathKeyboard = ({ onInsert, onClose }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const categories = ['basic', 'greek', 'relations', 'advanced'];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        width: '100%', 
        maxWidth: 400, 
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Math Keyboard
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 1 }} />
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable" 
        scrollButtons="auto"
        sx={{ minHeight: 36, mb: 1 }}
      >
        <Tab label="Basic" sx={{ py: 0.5, px: 1, minHeight: 36, fontSize: '0.75rem' }} />
        <Tab label="Greek" sx={{ py: 0.5, px: 1, minHeight: 36, fontSize: '0.75rem' }} />
        <Tab label="Rel." sx={{ py: 0.5, px: 1, minHeight: 36, fontSize: '0.75rem' }} />
        <Tab label="Adv." sx={{ py: 0.5, px: 1, minHeight: 36, fontSize: '0.75rem' }} />
      </Tabs>

      <Grid container spacing={0.5}>
        {symbols[categories[activeTab]].map((symbol, index) => (
          <Grid item xs={3} key={index}>
            <Tooltip title={symbol.latex} arrow>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => onInsert(symbol.latex)}
                sx={{ 
                  py: 1, 
                  fontSize: '0.9rem', 
                  minWidth: 0,
                  textTransform: 'none',
                  borderColor: 'rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }
                }}
              >
                {symbol.label}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Tip: Wrap math in \( ... \) for inline or \[ ... \] for block.
        </Typography>
      </Box>
    </Paper>
  );
};

export default MathKeyboard;
