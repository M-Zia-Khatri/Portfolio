import { Button, Dialog, Flex } from '@radix-ui/themes';
import { Menu } from 'lucide-react';
import { useCallback, useState } from 'react';
import { MagneticShinyButton } from './MagneticShinyButton';
import { navItems } from './TopBar.constants';
import { TopBarItem } from './TopBarItem';

export function TopBarMobile() {
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <div className="md:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button color="gray" className="px-2 py-2">
            <Menu />
          </Button>
        </Dialog.Trigger>

        <Dialog.Content className="fixed top-0 left-0 m-0 h-[60vh] w-full max-w-none rounded-t-none rounded-b-xl bg-(--gray-2)/50 backdrop-blur-md">
          <nav>
            <Flex asChild align="center" justify="center" direction="column" gap="5">
              <ul className="min-w-max">
                {navItems.map((item) => (
                  <TopBarItem key={item.sectionId} item={item} onNavigate={closeMenu} />
                ))}
              </ul>
            </Flex>
          </nav>
          <MagneticShinyButton />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
