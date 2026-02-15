import { getI18n } from '@/locales/server';
import Image from 'next/image';
import Link from 'next/link';

export default async function IntroductionSection() {
  const t = await getI18n();

  return (
    <section className="bg-violet text-brown p-section flex justify-center font-medium">
      <div className="max-w-contain ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <article className="flex flex-col gap-3">
            <h2>{t('MethodologyPage.introductionSection.title')}</h2>
        <Image src="/welfare-footprint-logo.svg" className="mt-3 mb-6" alt="welfare footprint institute logo" width={350} height={80} />
            <p>{t('MethodologyPage.introductionSection.paragraph1')}</p>
            <p>{t('MethodologyPage.introductionSection.paragraph2')}</p>
            <Link
              href="https://welfarefootprint.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="CTA white-button w-fit "
            >
              welfarefootprint.org
            </Link>
          </article>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-8">
            <Scientist
              imgUrl={'/Cynthia-Schuck-Paim.png'}
              name={'Cynthia Schuck-Paim'}
              text={t('MethodologyPage.introductionSection.scientist_text1')}
            />
            <Scientist
              imgUrl={'/Wladimir-J.Alonso.png'}
              name={'Wladimir J. Alonso'}
              text={t('MethodologyPage.introductionSection.scientist_text2')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface ScientistProps {
  imgUrl: string;
  name: string;
  text: string;
}

const Scientist = async ({ imgUrl, name, text }: ScientistProps) => {
  return (
    <div className="flex flex-col items-center">
      <Image src={imgUrl} alt="Scientist" className="rounded-full object-contain" width={220} height={220} />
      <h3 className="text-center my-5">{name}</h3>
      <p className="font-medium">{text}</p>
    </div>
  );
};
