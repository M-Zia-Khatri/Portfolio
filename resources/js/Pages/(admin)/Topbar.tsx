import { cn } from '@/shared/utils/cn';
import type { AppPageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ExitIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Box, Button, DropdownMenu, Flex, Separator, Text } from '@radix-ui/themes';
import { ArrowLeftIcon, Clock, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

type NavItem = {
  label: string;
  link: string;
};

const DEFAULT_NAV: NavItem[] = [
  { label: 'Dashboard', link: '/admin/dashboard' },
  { label: 'Skills', link: '/admin/skills' },
  { label: 'Portfolio', link: '/admin/portfolio' },
  { label: 'Contact', link: '/admin/contact' },
];

export default function Topbar() {
  const [time, setTime] = useState(new Date());
  const { url } = usePage<AppPageProps>();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    router.post('/logout'); // Laravel route
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--gray-5) bg-(--gray-2)/80 backdrop-blur-md">
      <Flex align="center" justify="between" px="6" height="64px">
        {/* Left */}
        <Flex align="center" gap="4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase opacity-70 transition-opacity hover:opacity-100"
          >
            <ArrowLeftIcon />
            Go Back
          </Link>

          <Separator orientation="vertical" size="1" />

          <Flex align="center" gap="3">
            <Box className="rounded-lg bg-(--blue-9) p-1.5 text-white">
              <Monitor size={18} />
            </Box>
            <Text size="3" weight="bold" className="hidden sm:block">
              Admin Portal
            </Text>
          </Flex>
        </Flex>

        {/* Right */}
        <Flex align="center" gap="5">
          <nav className="hidden md:block">
            <Flex gap="5" align="center">
              {DEFAULT_NAV.map((item) => {
                const isActive = url.startsWith(item.link);

                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={cn('text-sm font-medium transition-colors hover:text-(--blue-11)', isActive ? 'text-(--blue-11)' : 'text-(--gray-10)')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Flex>
          </nav>

          <Separator orientation="vertical" size="2" className="hidden md:block" />

          <Flex align="center" gap="3">
            <Flex align="center" gap="2" px="3" py="1" className="hidden rounded-full border border-(--gray-5) sm:flex">
              <Clock size={14} />
              <span>
                {time.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>
            </Flex>

            <Button variant="soft" color="red" onClick={handleLogout}>
              <ExitIcon />
              <Text className="hidden md:inline">Logout</Text>
            </Button>
          </Flex>

          {/* Mobile */}
          <div className="md:hidden">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft" size="2">
                  <HamburgerMenuIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {DEFAULT_NAV.map((item) => (
                  <DropdownMenu.Item key={item.link} asChild>
                    <Link href={item.link}>{item.label}</Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </Flex>
      </Flex>
    </header>
  );
}
