import Image from "next/image"
import { getTranslations } from "next-intl/server"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import Filter from "./Filter"

const Hero = async () => {
    const t = await getTranslations("homePage")

return (
    <div
        className="w-full relative mt-[-6px] bg-cover bg-center  min-h-[300px] lg:max-h-[660px]"
        style={{ backgroundImage: `url('/assets/images/HeroBackRound.png')`, backgroundSize: "cover" }}
    >
        <Box variant="container" className="flex items-center flex-col relative">
        {/* Rectangle image */}
        <div className="relative">
            <Image
            src="/assets/images/Rectangle.png"
            alt="Rectangle"
            width={397}
            height={300}
            className="w-[250px] sm:w-[180px] md:w-[200px] lg:w-[300px] xl:w-[397px] 
                    h-auto sm:h-[100px] md:h-[220px] lg:h-[280px] xl:h-[250px]"
            priority
            />

          {/* Text overlay on Rectangle */}
            <div className="absolute inset-0 flex flex-col justify-center items-center">
                <Text className="text-lg sm:text-2xl md:text-4xl lg:text-[60px] font-bold text-white text-center">
                {t("hero.title")}
                </Text>
                <Text className="text-lg sm:text-xl md:text-3xl lg:text-[30px] font-bold text-white text-center mt-2">
                {t("hero.description")}
                </Text>
            </div>
        </div>

        {/* Car image positioned below the Rectangle */}
        <div className="mt-[-40px] sm:mt-[-50px] md:mt-[-60px] lg:mt-[-50px] xl:mt-[-60px] z-10">
            <Image
                src="/assets/images/carHeader.png"
                alt="cars"
                width={800}
                height={400}
                className="w-[280px] sm:w-[400px] md:w-[500px] lg:w-[650px] xl:w-[700px] h-auto"
            />
            </div>
        </Box>
                  <Filter />

    </div>
  )
}

export default Hero
