import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Help = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Help & FAQ
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">What is this application?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            This application is a DNS filtering tool that helps you manage and block certain domains.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">How do I add a domain to the blocklist?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Navigate to the Blocklist section, enter the domain you want to block, and click the 'Add' button.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">How can I view the analytics?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Go to the Analytics Panel section to view various statistics and graphs about DNS requests and blocks.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">How can I change the DNS server settings?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Visit the Settings section where you can change the DNS server IP address, port number, and other settings.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default Help;
