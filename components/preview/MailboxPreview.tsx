'use client';

import { useState } from 'react';
import CareerMailbox from '@/components/games/career/CareerMailbox';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import type { MailItem } from '@/lib/utils/careerSave';

export default function MailboxPreview({
  initialMail,
}: {
  initialMail: MailItem[];
}) {
  const [mail, setMail] = useState(initialMail);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label="Restore every letter"
          onClick={() => setMail(initialMail)}
        />
      </div>
      <div className="mx-auto w-full max-w-sm">
        <CareerMailbox
          mail={mail}
          canAcceptSponsor
          canDonate={() => true}
          balance={640}
          onMarkRead={(id) =>
            setMail((m) =>
              m.map((x) => (x.id === id ? { ...x, read: true } : x)),
            )
          }
          onMarkAllRead={() =>
            setMail((m) => m.map((x) => ({ ...x, read: true })))
          }
          onAcceptSponsor={(id) =>
            setMail((m) =>
              m.map((x) =>
                x.id === id || x.kind === 'sponsor-offer'
                  ? { ...x, read: true }
                  : x,
              ),
            )
          }
          onDonate={(id) =>
            setMail((m) =>
              m.map((x) => (x.id === id ? { ...x, read: true } : x)),
            )
          }
        />
      </div>
    </>
  );
}
