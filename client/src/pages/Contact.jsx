const contactMembers = [
  {
    name: 'ACABADO, JULIE ANN M. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'acabadojulieann@gmail.com',
    photo: '/dist/assets/contact-photos/JULIE ANN M. ACABADO .jpeg',
  },
  {
    name: 'BATAN, ANGELA M. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'batanangela30@gmail.com',
    photo: '/dist/assets/contact-photos/ANGELA M. BATAN .jpeg',
  },
  {
    name: 'DE LEON, HANNA P. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'hannadeleon279@gmail.com',
    photo: '/dist/assets/contact-photos/HANNA P. DE LEON.jpeg',
  },
  {
    name: 'RABEJE, MARK ANGEL B. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'markangelrabeje@gmail.com',
    photo: '/dist/assets/contact-photos/MARK ANGEL B. RABEJE .jpeg',
  },
  {
    name: 'SEDILLA, PAULINE KRISZHA B. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'sedillapauline@gmail.com',
    photo: '/dist/assets/contact-photos/PAULINE KRISZHA B. SEDILLA.jpeg',
  },
  {
    name: 'TOMENIO, SANDARA C. ',
    course: 'Bachelor of Secondary Education',
    major: 'Major in English',
    email: 'Sandaratomenio50@gmail.com',
    photo: '/dist/assets/contact-photos/SANDARA C. TOMENIO .jpeg',
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
