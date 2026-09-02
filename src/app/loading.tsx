import { PageContainer, Shell, Skeleton } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <Shell>
      <main className="pt-28">
        <PageContainer className="pb-16">
          <Skeleton className="h-72 w-full" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        </PageContainer>
      </main>
    </Shell>
  );
}
