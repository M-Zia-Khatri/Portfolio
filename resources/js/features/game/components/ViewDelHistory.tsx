import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import { useGuessNumActions } from '../context/GuessNumContext';
import useGameSet from '../store/GameSetStore';

export default function ViewDelHistory() {
  const scoreHistoryLength = useGameSet((state) => state.scoreHistory.length);
  const { clearHistory } = useGuessNumActions();

  if (scoreHistoryLength === 0) {
    return (
      <p className="text-center text-sm italic" style={{ color: 'var(--gray-10)' }}>
        No history available.
      </p>
    );
  }

  return (
    <Flex align="center" justify="end" gap="2" wrap="wrap">
      {/* Delete All */}
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="soft" color="red" size="2">
            Delete All
          </Button>
        </AlertDialog.Trigger>

        <AlertDialog.Content
          maxWidth="420px"
          style={{
            background: 'var(--gray-2)',
            border: '1px solid var(--gray-5)',
          }}
        >
          <AlertDialog.Title style={{ color: 'var(--gray-12)' }}>
            Delete all history?
          </AlertDialog.Title>
          <AlertDialog.Description style={{ color: 'var(--gray-11)' }}>
            This will permanently delete all game history. This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={clearHistory}>
                Yes, Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
}
