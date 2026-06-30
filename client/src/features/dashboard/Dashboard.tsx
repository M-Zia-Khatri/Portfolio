import { Card, Container, Heading, Section, Text } from "@radix-ui/themes";
import SEO from "@/shared/components/SEO";

export default function Dashboard() {
  return (
    <Section>
      <SEO
        title="Admin - Dashboard"
        description="This is the dashboard only accessible by admin."
        canonical="https://ziakhatri.site/dashboard"
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
