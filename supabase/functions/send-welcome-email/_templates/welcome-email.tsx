import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WelcomeEmailProps {
  name: string;
  wallet_address?: string;
}

export const WelcomeEmail = ({ name, wallet_address }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Polymers Network - Start earning PLY tokens! 🌱</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <div style={logo}>🌱</div>
          <Heading style={h1}>Welcome to Polymers Network!</Heading>
        </Section>
        
        <Text style={text}>Hi {name},</Text>
        
        <Text style={text}>
          Welcome to the future of sustainable recycling! You've just joined the Polymers Network, 
          where every piece of plastic you recycle earns you PLY tokens and helps save our planet.
        </Text>

        {wallet_address && (
          <Section style={walletSection}>
            <Text style={walletTitle}>🔗 Your Connected Wallet:</Text>
            <Text style={walletAddress}>{wallet_address}</Text>
          </Section>
        )}

        <Section style={featuresSection}>
          <Heading style={h2}>What you can do now:</Heading>
          <ul style={featuresList}>
            <li style={featureItem}><strong>📱 Scan & Earn:</strong> Use your phone to scan plastic items and earn PLY tokens</li>
            <li style={featureItem}><strong>🏆 Complete Challenges:</strong> Join daily and weekly challenges for bonus rewards</li>
            <li style={featureItem}><strong>🌍 Support Projects:</strong> Donate to environmental projects using your tokens</li>
            <li style={featureItem}><strong>📊 Track Impact:</strong> See your environmental impact grow in real-time</li>
          </ul>
        </Section>

        <Section style={ctaSection}>
          <Button href="https://60ce5f4f-6cc7-4428-b362-21ffefa4b3b9.lovableproject.com" style={button}>
            Start Recycling Now
          </Button>
        </Section>

        <Text style={rewardsText}>
          💰 <strong>Get Started Bonus:</strong> Complete your first recycling submission to earn 10 PLY tokens!
        </Text>

        <Text style={footerText}>
          Questions? Reply to this email or visit our{' '}
          <Link href="https://polymers.network/help" style={link}>
            Help Center
          </Link>
        </Text>

        <Text style={signature}>
          Happy recycling!<br/>
          The Polymers Network Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
  backgroundColor: '#1B5E20',
  borderRadius: '8px 8px 0 0',
};

const logo = {
  fontSize: '48px',
  marginBottom: '16px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const h2 = {
  color: '#1B5E20',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 32px',
};

const walletSection = {
  backgroundColor: '#f8f9fa',
  padding: '16px',
  margin: '24px 32px',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
};

const walletTitle = {
  color: '#1B5E20',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const walletAddress = {
  color: '#6c757d',
  fontSize: '14px',
  fontFamily: 'monospace',
  margin: '0',
  wordBreak: 'break-all' as const,
};

const featuresSection = {
  margin: '32px',
};

const featuresList = {
  margin: '0',
  padding: '0',
  listStyle: 'none',
};

const featureItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
  paddingLeft: '8px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4CAF50',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0',
};

const rewardsText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 32px',
  padding: '16px',
  backgroundColor: '#e8f5e8',
  borderRadius: '8px',
  border: '1px solid #4CAF50',
};

const footerText = {
  color: '#6c757d',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px',
  textAlign: 'center' as const,
};

const signature = {
  color: '#1B5E20',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px',
  textAlign: 'center' as const,
  fontWeight: 'bold',
};

const link = {
  color: '#4CAF50',
  textDecoration: 'underline',
};