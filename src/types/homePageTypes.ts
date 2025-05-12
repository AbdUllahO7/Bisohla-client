
export interface CarCardItemProps {
    title: string;
    marka: string;
    price: string;
    imageSrc: string;
    priceWord: string;
    details? : {
        fuelType : string,
        transmission:string
    },
    ProductId : number
    type? : string
}
export interface CarCardItemPropsProfile {
    title: string;
    marka: string;
    imageSrc: string;
    priceWord : string;
    price :Number;
    details? : {
        gaz : string,
        type:string
    },
    ProductId : number;
    isFavorites : boolean,
    type? : string
    onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
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
  required?: boolean
  error?: string
  onChange?: (name: string, value: string) => void
  value?: string
  name?: string
  onBlur?: (field: string, value: string) => void
  disabled?:boolean
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
        BrowseAll : string;
    };
}


export interface LatestOffersProps {
    count?: number; // Optional count of cards to display
    showTitle?: boolean; // Control the visibility of the title and "Show More" link
    container?: boolean
}