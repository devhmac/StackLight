import React from "react";
import { Button } from "../../ui/button";
import { BranchTable } from "../branch-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Alert, AlertDescription } from "../../ui/alert";
import { cn } from "@/lib/utils";
import { RepoDetails } from "@/types/digest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ghost, GitBranch, InboxIcon, InfoIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { SyncButton } from "../digest-shell";

const Inbox = ({ repo }: { repo: RepoDetails }) => {
  const branches = repo?.branches ?? [];
  const newBranches = branches.filter((b) => b.isNew);
  const hasUpdates = newBranches.length > 0;

  // if (!hasUpdates) {
  //   return (
  //     <Empty className="border border-dashed">
  //       <EmptyHeader>
  //         <Ghost />
  //         <EmptyTitle>No Updates</EmptyTitle>
  //         <EmptyDescription>
  //           No new activity since your last session
  //         </EmptyDescription>
  //       </EmptyHeader>
  //     </Empty>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <InboxIcon className="h-5 w-5" />
            Inbox
          </div>
          {hasUpdates && (
            <Alert className="border-accent-foreground bg-accent p-2 my-2">
              <AlertDescription className="flex flex-wrap items-center justify-between text-accent-foreground">
                <div className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4" />
                  New updates since your last session
                </div>
                <Button size="sm" variant="default">
                  Mark as seen
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardTitle>
      </CardHeader>
      {
        <CardContent>
          {hasUpdates ? (
            <Accordion
              type="multiple"
              // collapsible
              className={cn("rounded-lg border")}
              // defaultValue="branches"
            >
              {newBranches.length > 0 && (
                <AccordionItem
                  defaultValue={"branches"}
                  key={"branch-accordion"}
                  value={"branches"}
                >
                  <AccordionTrigger className="hover:bg-accent px-4">
                    <h3 className="flex gap-2 text-md">
                      <GitBranch className="h-4 w-4" /> New Branches
                      <span className="text-green-700 text-sm">
                        + {newBranches.length}
                      </span>
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <BranchTable branches={newBranches} />
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          ) : (
            <EmptyHeader className="mx-auto">
              <div className="flex gap-2">
                <Ghost />
                <EmptyTitle>No Updates</EmptyTitle>
              </div>
              <EmptyDescription>
                No new activity since your last session
              </EmptyDescription>
              <SyncButton repoId={repo.id} />
            </EmptyHeader>
          )}
        </CardContent>
      }
    </Card>
  );
};

export default Inbox;
