
export interface CarCardItemProps {
    title: string;
    marka: string;
    price: string;
    imageSrc: string;
    priceWord: string;
    details? : {
        gaz : string,
        type:string
    }
}
export interface CitiesDataType {
    title : string , 
    carCount :string,
    image: string
}