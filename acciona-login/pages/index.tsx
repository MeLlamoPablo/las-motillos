import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import fetch from "node-fetch";
import {z} from "zod"

export default function Home({
  appUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main>
      <ol>
        <li><a href={appUrl}>Download the link app for Android</a>.</li>
        <li>Go to the "Las Motillos" skill on your Alexa app on Android.</li>
        <li>Enable the skill and login on the link app.</li>
      </ol>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await fetch("https://api.github.com/repos/MeLlamoPablo/las-motillos/releases/latest");
  const ResponseZ = z.object({
    assets: z.array(
      z.object({
        name: z.string(),
        browser_download_url: z.string(),
      }),
    )
  });

  const parsed = ResponseZ.safeParse(await response.json())

  if (!parsed.success) {
    return {
      notFound: true,
    }
  }

  const asset = parsed.data.assets.find(asset => asset.name === "app-release.apk");

  if (!asset) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      appUrl: asset.browser_download_url,
    },
  };
};
