'use client'
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Box from "@/components/box/box";
import { useTranslations } from "next-intl";

const EditProfile = () => {
    const [avatar, setAvatar] = useState<string>("/default-avatar.png");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [repeatPassword, setRepeatPassword] = useState<string>("");


    const t = useTranslations('UserProfile.profile');
    
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };

    return (
        <Box variant="row" className="w-full shadow-lg flex-wrap justify-center items-center">
            <Box variant="column" className="w-full max-w-md p-4 shadow-lg rounded-xl min-h-[600px]">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-semibold">{t('editProfile')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 w-full">
                    <Box className="relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={avatar} alt="User Avatar" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </Box>
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="name"> {t('name')}</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name')}/>
                    </Box>
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="email"> {t('email')}</Label>
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email')}/>
                    </Box>
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="phoneNumber">{t('phoneNumber')}</Label>
                        <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder= {t('phoneNumber')} />
                    </Box>
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="location">{t('location')}</Label>
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('location')}/>
                    </Box>
                    <Button className="w-full">{t('saveChanges')}</Button>
                </CardContent>
            </Box>
            <Box variant="column" className="w-full max-w-md justify-center p-4 shadow-lg rounded-xl min-h-[600px]">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-semibold"> {t('resetPassword')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 w-full">
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="oldPassword">{t('oldPassword')}</Label>
                        <Input id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder= {t('oldPassword')} />
                    </Box>
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="newPassword">{t('newPassword')}</Label>
                        <Input id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('newPassword')}/>
                    </Box>
                    <Box variant="column" className="w-full items-start">
                        <Label htmlFor="repeatPassword">{t('repeatPassword')}</Label>
                        <Input id="repeatPassword" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} placeholder={t('repeatPassword')}/>
                    </Box>
                    <Button className="w-full">{t('saveChanges')}</Button>
                </CardContent>
            </Box>
        </Box>
    );
};

export default EditProfile;
