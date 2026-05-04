import { Box, Flex } from '@radix-ui/themes';
import { navItems } from './TopBar.constants';
import { TopBarItem } from './TopBarItem';

export function TopBarNav() {
  return (
    <Box asChild className="flex-1 overflow-x-auto hidden md:block">
      <nav aria-label="Main navigation">
        <Flex asChild align="center" justify="center" gap="5">
          <ul className="min-w-max">
            {navItems.map((item) => (
              <TopBarItem item={item} />
            ))}
          </ul>
        </Flex>
      </nav>
    </Box>
  );
}
