'use client'
import React, { useEffect, useState } from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Input } from "@/components/ui/input";
import { useLocale, useTranslations } from "next-intl";
import SelectDropdown from "@/components/SelectDropdown";

interface BoxState {
    price?: string;
    currency?: string;
    selectedColor: string;
    selectedGazType: string;
}

const AddProductStepTwo: React.FC = () => {
    const t = useTranslations("addProduct");
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [box1, setBox1] = useState<BoxState>({ price: "", currency: "", selectedColor: "", selectedGazType: "" });
    const [box2, setBox2] = useState<BoxState>({ selectedColor: "", selectedGazType: "" });
    const [box3, setBox3] = useState<BoxState>({ selectedColor: "", selectedGazType: "" });

    const handleChange = (index: number, field: keyof BoxState, value: string) => {
        if (index === 0) {
            setBox1(prevState => ({ ...prevState, [field]: value }));
        } else if (index === 1) {
            setBox2(prevState => ({ ...prevState, [field]: value }));
        } else if (index === 2) {
            setBox3(prevState => ({ ...prevState, [field]: value }));
        }
    };

    const colorOptions = [
        { value: "red", label: t('enteredData.stepTow.color.options.red') },
        { value: "green", label: t('enteredData.stepTow.color.options.green') },
        { value: "yellow", label: t('enteredData.stepTow.color.options.yellow') },
        { value: "blue", label: t('enteredData.stepTow.color.options.blue') },
    ];

    const gazTypeOptions = [
        { value: "petrol", label: t('enteredData.stepTow.gaz.options.petrol') },
        { value: "diesel", label: t('enteredData.stepTow.gaz.options.diesel') },
        { value: "electric", label: t('enteredData.stepTow.gaz.options.electric') },
        { value: "hybrid", label: t('enteredData.stepTow.gaz.options.hybrid') },
    ];

    const currencyOptions = [
        { value: "usd", label: t('enteredData.stepTow.price.options.usd') },
        { value: "eur", label: t('enteredData.stepTow.price.options.eur') },
        { value: "try", label: t('enteredData.stepTow.price.options.try') },
        { value: "gbp", label: t('enteredData.stepTow.price.options.gbp') },
    ];

    const boxes = [
        { ...box1, hasPriceAndCurrency: true },
        { ...box2, hasPriceAndCurrency: false },
        { ...box3, hasPriceAndCurrency: false }
    ];

    return (
        <Box className="" variant="column">
            <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center" variant="row" dir={direction}>
                <Box className="bg-gray-100 px-5 py-5 w-full flex justify-center">
                    <Text className="font-bold text-primary">
                        {direction === "ltr" ? "Car Information" : "معلومات السيارة"}
                    </Text>
                </Box>

                {boxes.map((box, index) => (
                    <Box key={index} className="justify-start items-start min-w-[400px] px-5 py-5 gap-5" variant="column">
                        {box.hasPriceAndCurrency && (
                            <Box className="flex gap-2 w-full max-w-sm">
                                <Box variant="column" className="justify-start items-start">
                                    <Text className="font-bold text-primary">{direction === "ltr" ? "Price" : "السعر"}</Text>
                                    <Input
                                        type="text"
                                        value={box.price || ""}
                                        onChange={(e) => handleChange(index, "price", e.target.value)}
                                        placeholder={direction === "ltr" ? "Enter price" : "أدخل السعر"}
                                        className="min-w-[200px]"
                                    />
                                </Box>
                                <Box variant="column" className="justify-start items-start">
                                    <Text className="font-bold text-primary">{direction === "ltr" ? "Currency" : "العملة"}</Text>
                                    <SelectDropdown
                                        options={currencyOptions}
                                        placeholder={direction === "ltr" ? "Select a currency" : "اختر العملة"}
                                        className="w-[150px] "
                                        SelectTriggerStyle="w-[150px]"
                                        label=""
                                    />
                                </Box>
                            </Box>
                        )}
                        <Box className="gap-2 justify-start items-start w-full" variant="column">
                            <Text className="font-bold text-primary">{direction === "ltr" ? "Color" : "اللون"}</Text>
                            <SelectDropdown
                                options={colorOptions}
                                placeholder={direction === "ltr" ? "Select a Color" : "اختر اللون"}
                                className="w-full"
                                SelectTriggerStyle="w-full"
                                label=""
                            />
                        </Box>
                        <Box className="gap-2 justify-start items-start w-full" variant="column">
                            <Text className="font-medium text-gray-700">{direction === "ltr" ? "Gaz Type" : "نوع الغاز"}</Text>
                            <SelectDropdown
                                options={gazTypeOptions}
                                placeholder={direction === "ltr" ? "Select a Gaz Type" : "اختر نوع الغاز"}
                                className="w-full"
                                SelectTriggerStyle="w-full"
                                label=""
                            />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default AddProductStepTwo;
