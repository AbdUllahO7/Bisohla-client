
export interface CarCardItemProps {
    title: string;
    marka: string;
    price: string;
    imageSrc: string;
    priceWord: string;
    details? : {
        gaz : string,
        type:string
    },
    ProductId : number
}
export interface CarCardItemPropsProfile {
    title: string;
    marka: string;
    imageSrc: string;
    priceWord : string;
    price :string;
    details? : {
        gaz : string,
        type:string
    },
    ProductId : number;
    isFavorites : boolean
}
export interface CitiesDataType {
    title : string , 
    carCount :string,
    image: string
}


export interface SelectDropdownProps {
  label?: string; // Optional label for the dropdown
  options: { value: string; label: string }[]; // Define the structure of the options
  placeholder?: string; // Placeholder text
  className?: string; // Additional class names
  SelectTriggerStyle?: string;
  labelStyle?: string;
}

export interface CarouselComponentProps {
    data: CitiesDataType[];
    direction: 'ltr' | 'rtl'; // Add direction as a prop
}


export interface HeaderTowProps {
    translations: {
        home: string;
        rent: string;
        sale: string;
        news: string;
        join: string;
    };
}


export interface LatestOffersProps {
    count?: number; // Optional count of cards to display
    showTitle?: boolean; // Control the visibility of the title and "Show More" link
    container?: boolean
}