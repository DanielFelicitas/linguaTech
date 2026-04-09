const getInitials = (name) =>
  (name || '')
    .split(/[,\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'LT'

const getFallbackAvatar = (name) => {
  const initials = getInitials(name)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="100%" height="100%" fill="#E9EDF7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="88" font-weight="700" fill="#5A4DD5">${initials}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const contactMembers = [
  {
    name: 'ACABADO, JULIE ANN M. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'acabadojulieann@gmail.com',
    photo: '/contact-photos/JULIE ANN M. ACABADO .jpeg',
  },
  {
    name: 'BATAN, ANGELA M. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'batanangela30@gmail.com',
    photo: '/contact-photos/ANGELA M. BATAN .jpeg',
  },
  {
    name: 'DE LEON, HANNA P. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'hannadeleon279@gmail.com',
    photo: '/contact-photos/HANNA P. DE LEON.jpeg',
  },
  {
    name: 'RABEJE, MARK ANGEL B. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'markangelrabeje@gmail.com',
    photo: '/contact-photos/MARK ANGEL B. RABEJE .jpeg',
  },
  {
    name: 'SEDILLA, PAULINE KRISZHA B. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'sedillapauline@gmail.com',
    photo: '/contact-photos/PAULINE KRISZHA B. SEDILLA.jpeg',
  },
  {
    name: 'TOMENIO, SANDARA C. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'Sandaratomenio50@gmail.com',
    photo: '/contact-photos/SANDARA C. TOMENIO .jpeg',
  },
]

function Contact() {
  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#5A4DD5]">Contact Our Team</h1>
        <p className="text-[#6E7382]">
          Connect with the LinguaTech team members for collaboration and project concerns.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contactMembers.map((member) => (
          <article
            key={member.email}
            className="rounded-2xl border border-[#d8dbe7] bg-white p-4 shadow-sm"
          >
            <img
              src={encodeURI(member.photo)}
              alt={member.name}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = getFallbackAvatar(member.name)
              }}
              className="mb-3 h-56 w-full rounded-xl bg-[#f2f4fa] object-contain"
              loading="lazy"
            />
            <h2 className="text-base font-bold text-[#1F2430]">{member.name}</h2>
            <p className="mt-1 text-sm text-[#6E7382]">{member.course}</p>
            <p className="mt-1 text-sm text-[#6E7382]">{member.major}</p>
            <a
              href={`mailto:${member.email}`}
              className="mt-3 inline-block text-sm font-semibold text-[#2979FF] hover:underline"
            >
              {member.email}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Contact
