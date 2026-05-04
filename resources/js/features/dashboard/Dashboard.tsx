import SEO from '@/shared/components/SEO';
import { Card, Container, Heading, Section, Text } from '@radix-ui/themes';

export default function Dashboard() {
  return (
    <Section>
      <SEO
        title="Admin - Dasboard"
        description="This the dashboard only accessable by admin."
        canonical="https://zia-khatri.vercel.app/dashboard"
      />
      <Container size="4">
        <Heading mb="4">Dashboard Overview</Heading>
        <Card size="3">
          <Text as="p" color="gray">
            Welcome to your admin panel. Use the top navigation to manage your skills, portfolio,
            and contact messages.
          </Text>
        </Card>
      </Container>
    </Section>
  );
}
