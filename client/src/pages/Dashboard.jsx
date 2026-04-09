function Dashboard() {
  const stats = [
    { label: 'Speaking Sessions', value: '12', color: '#2979FF', status: 'On track' },
    { label: 'Writing Tasks', value: '18', color: '#00C853', status: 'High performance' },
    { label: 'Communication Score', value: '82%', color: '#FF3D00', status: 'Needs focus' },
  ]

  return (
    <section>
      <h1 className="mb-6 text-3xl font-bold text-[#5A4DD5]">Student Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm"
          >
            <p className="text-sm text-[#6E7382]">{item.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="mt-2 text-xs font-semibold" style={{ color: item.color }}>
              {item.status}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
