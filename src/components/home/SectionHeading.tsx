export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-10">
      <div className="md:col-span-7 lg:col-span-8">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      <p className="text-pretty text-sm leading-6 text-muted-foreground md:col-span-5 md:text-right lg:col-span-4">
        {description}
      </p>
    </div>
  )
}
