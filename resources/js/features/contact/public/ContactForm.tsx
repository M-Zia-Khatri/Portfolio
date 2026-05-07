import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { useForm } from '@inertiajs/react';
import { CheckCircledIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import { Button, Callout, Card, Flex, Heading, Separator, Text, TextArea, TextField } from '@radix-ui/themes';

type ContactFormValues = { fullName: string; email: string; message: string };

function ContactFormCard() {
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm<ContactFormValues>({
    fullName: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('contact.submit'), {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Card size="3">
      <div className="space-y-2">
        <Heading as="h3" size={HEADING.h3.size} weight="bold" className="text-center text-white">
          Contact Form
        </Heading>
        <Text size={TEXT.sm.size} weight="medium">
          Please contact me directly at{' '}
          <Text size={TEXT.sm.size} className="font-extrabold text-(--blue-a11)" as="span">
            muhammadziakhatri@gmail.com
          </Text>{' '}
          or drop your info here.
        </Text>
      </div>
      <Separator my="4" className="w-full" />

      {recentlySuccessful && (
        <Callout.Root color="green">
          <Callout.Icon>
            <CheckCircledIcon />
          </Callout.Icon>
          <Callout.Text>Your message was sent! I’ll get back to you soon.</Callout.Text>
        </Callout.Root>
      )}

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          {/* Full Name */}
          <div>
            <Text>Full Name</Text>
            <TextField.Root value={data.fullName} onChange={(e) => setData('fullName', e.target.value)} />
            {errors.fullName && <Text color="red">{errors.fullName}</Text>}
          </div>

          {/* Email */}
          <div>
            <Text>Email</Text>
            <TextField.Root type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
            {errors.email && <Text color="red">{errors.email}</Text>}
          </div>

          {/* Message */}
          <div>
            <Text>Message</Text>
            <TextArea value={data.message} onChange={(e) => setData('message', e.target.value)} />
            {errors.message && <Text color="red">{errors.message}</Text>}
          </div>

          <Text size="1" color="blue" weight="medium">
            I&apos;ll never share your data with anyone else. Pinky promise!
          </Text>

          <Button type="submit" disabled={processing}>
            {processing ? (
              'Sending...'
            ) : (
              <>
                Send Message <PaperPlaneIcon />
              </>
            )}
          </Button>
        </Flex>
      </form>
    </Card>
  );
}

export default ContactFormCard;
