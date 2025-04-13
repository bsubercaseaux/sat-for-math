import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { Box, Typography } from "@mui/material";

const Footer = () => {
    return (
        // <footer style={{position: 'sticky'}}> 
        //     <AppBar color="primary">
        //         <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'row'}}>
        //             This page is a fork of~ <a href="https://algorithms-with-predictions.github.io/" style={{color: '#40A840'}}> algorithms-with-predictions.github.io</a>.
        //         </div>
        //     </AppBar>
        // </footer>
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: 3,
                mt: 'auto',
                flexShrink: 0
            }}>
            <Typography gutterBottom align="center">
            This page is a fork of <a href="https://algorithms-with-predictions.github.io/" style={{color: '#80D860'}}> algorithms-with-predictions.github.io</a>, thanks to the authors!
            </Typography>
            
        </Box>
    );
};


export default Footer;