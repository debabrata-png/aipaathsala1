import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';

const latexItems = [
    { label: 'Fraction', example: '\\frac{a}{b}', code: '\\frac{}{}' },
    { label: 'Square Root', example: '\\sqrt{x}', code: '\\sqrt{}' },
    { label: 'Power', example: 'x^{n}', code: '^{}' },
    { label: 'Subscript', example: 'x_{i}', code: '_{}' },
    { label: 'Integral', example: '\\int_{a}^{b} f(x) dx', code: '\\int' },
    { label: 'Summation', example: '\\sum_{i=1}^{n}', code: '\\sum' },
    { label: 'Limit', example: '\\lim_{x \\to \\infty}', code: '\\lim_{x \\to 0}' },
    { label: 'Greek Alpha', example: '\\alpha', code: '\\alpha' },
    { label: 'Matrix', example: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', code: '\\begin{pmatrix}  &  \\\\  &  \\end{pmatrix}' },
];

const LatexHelper = ({ onSelect, onClose }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                width: '100%',
                maxWidth: 300,
                maxHeight: 500,
                overflow: 'auto',
                borderRadius: 2
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    LaTeX Reference
                </Typography>
                {onClose && (
                    <IconButton size="small" onClick={onClose}>
                        <Close fontSize="small" />
                    </IconButton>
                )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            <List dense sx={{ py: 0 }}>
                {latexItems.map((item, index) => (
                    <ListItem
                        key={index}
                        button
                        onClick={() => onSelect(item.code)}
                        sx={{ px: 1, borderRadius: 1, mb: 0.5 }}
                    >
                        <ListItemText
                            primary={item.label}
                            secondary={item.example}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{
                                variant: 'caption',
                                sx: {
                                    fontFamily: 'monospace',
                                    bgcolor: 'action.hover',
                                    p: 0.5,
                                    borderRadius: 0.5,
                                    display: 'inline-block',
                                    mt: 0.5
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default LatexHelper;
