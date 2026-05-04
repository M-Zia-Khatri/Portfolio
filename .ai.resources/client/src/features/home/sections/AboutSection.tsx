import ziaImg from '@/assets/images/zia.png';
import SecComponent from '@/shared/components/SecContainer';
import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { AspectRatio, Box, Grid, Heading, Strong, Text } from '@radix-ui/themes';
import { motion } from 'motion/react';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

export default function AboutSection() {
  return (
    <SecComponent>
      <Grid
        columns={{ sm: '3' }}
        rows={{ sm: '1' }}
        // flow={{ initial: "column", lg: "row" }}
        gap={{ initial: '6', sm: '4', lg: '6' }}
      >
        {/* Image */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="order-2 px-4 md:px-0"
        >
          <AspectRatio ratio={4 / 5}>
            <motion.img
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              className="h-full  w-full drop-shadow-[0_0_15px_color-mix(in_srgb,var(--blue-3),transparent_10%)]"
              src={ziaImg}
              title="My picture"
              alt="my image"
            />
          </AspectRatio>
        </MotionBox>

        {/* Text */}
        <MotionBox
          className="order-1 flex flex-col justify-center text-center md:order-3 md:col-span-2 md:text-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <MotionHeading
            as="h2"
            size={HEADING.h2.size}
            className="font-bold"
            mb={{ initial: '3', sm: '4' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            About Me
          </MotionHeading>

          <MotionText size={TEXT.base.size}>
            Hi, I'm&nbsp;
            <Strong className="text-(--blue-a12)">Zia</Strong>, a&nbsp;
            <Strong className="text-(--blue-a12)">Full-Stack Developer</Strong> who builds&nbsp;
            <Strong className="text-(--blue-a12)">fast, scalable web applications</Strong>. I work
            primarily with&nbsp;
            <Strong className="text-(--blue-a12)">React</Strong>,&nbsp;
            <Strong className="text-(--blue-a12)">Node.js</Strong>,&nbsp;
            <Strong className="text-(--blue-a12)">PHP</Strong>, and&nbsp;
            <Strong className="text-(--blue-a12)">Laravel</Strong> to create modern digital
            products. My focus is on&nbsp;
            <Strong className="text-(--blue-a12)">clean architecture</Strong>
            ,&nbsp;
            <Strong className="text-(--blue-a12)">performance optimization</Strong>, and&nbsp;
            <Strong className="text-(--blue-a12)">maintainable code</Strong>. I enjoy&nbsp;
            <Strong className="text-(--blue-a12)">solving complex problems</Strong>
            &nbsp; and turning ideas into&nbsp;
            <Strong className="text-(--blue-a12)">reliable web solutions</Strong>. I aim to build
            applications that are both&nbsp;
            <Strong className="text-(--blue-a12)">efficient</Strong> and&nbsp;
            <Strong className="text-(--blue-a12)">user-focused</Strong>.
          </MotionText>
        </MotionBox>
      </Grid>
    </SecComponent>
  );
}
