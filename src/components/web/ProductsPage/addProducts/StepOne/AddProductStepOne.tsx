"use client"
import React, { useEffect } from "react"
import Box from "@/components/box/box"
import type { AddProductStepOneProps } from "./types"
import { useProductStepOne } from "./hooks"
import SelectableList from "./SelectableList"
import ErrorMessage from "./ErrorMessage"
import AddressField from "./AddressField"
import StoryField from "./StoryField"

const AddProductStepOne: React.FC<AddProductStepOneProps> = ({
  onValidationChange,
  isEditMode = false,
  initialData = null,
}) => {
  const {
    selectedOptions,
    direction,
    carMarka,
    carModel,
    carTrim,
    governorateOptions,
    cityOptions,
    madeYear,
    hasErrors,
    titles,
    handleSelectChange,
    handleAddressChange,
    handleStoryChange,
    setInitialEditData,
  } = useProductStepOne(onValidationChange)

  // Use effect to initialize edit data when in edit mode and initialData is available
  useEffect(() => {
    if (isEditMode && initialData && initialData.data) {
      setInitialEditData({
        marka: initialData.data[0].makeId?.toString() || "",
        model: initialData.data[0].modelId?.toString() || "",
        trim: initialData.data[0].trimId?.toString() || "",
        year: initialData.data[0].details?.year?.toString() || "",
        story: initialData.data[0].story || "",
        governorate: initialData.data[0].governorate || "",
        city: initialData.data[0].city || "",
        address: initialData.data[0].address || "",
      })
    }
  }, [isEditMode, initialData, setInitialEditData])

  return (
    <Box
      className="w-full max-w-7xl justify-start items-center bg-white rounded-lg flex-wrap xs:justify-center p-4"
      variant="column"
      dir={direction}
    >
      {hasErrors && <ErrorMessage message={titles.error} />}

      <Box
        className="w-full justify-start items-center flex-wrap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variant="row"
      >
        {/* Car selection fields */}
        <SelectableList
          title={titles.brand}
          type="marka"
          options={carMarka}
          selectedValue={selectedOptions.marka}
          direction={direction}
          onSelect={handleSelectChange}
          required={true}
        />

        <SelectableList
          title={titles.model}
          type="model"
          options={selectedOptions.marka ? carModel : []}
          selectedValue={selectedOptions.model}
          direction={direction}
          onSelect={handleSelectChange}
          required={true}
        />

        <SelectableList
          title={titles.trim}
          type="trim"
          options={selectedOptions.model ? carTrim : []}
          selectedValue={selectedOptions.trim}
          direction={direction}
          onSelect={handleSelectChange}
          required={true}
        />

        <SelectableList
          title={titles.year}
          type="year"
          options={madeYear}
          selectedValue={selectedOptions.year}
          direction={direction}
          onSelect={handleSelectChange}
          required={true}
        />

        {/* Location selection fields */}
        <SelectableList
          title={titles.governorate}
          type="governorate"
          options={governorateOptions}
          selectedValue={selectedOptions.governorate}
          direction={direction}
          onSelect={handleSelectChange}
          required={true}
        />

        <SelectableList
          title={titles.city}
          type="city"
          options={selectedOptions.governorate ? cityOptions : []}
          selectedValue={selectedOptions.city}
          direction={direction}
          onSelect={handleSelectChange}
          required={true}
        />

        {/* Address field */}
        <div className="sm:col-span-2">
          <AddressField
            title={titles.address}
            placeholder={titles.addressPlaceholder}
            value={selectedOptions.address}
            onChange={handleAddressChange}
            direction={direction}
            required={true}
          />
        </div>

        {/* Story field */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <StoryField
            title={titles.story}
            placeholder={titles.placeholder}
            value={selectedOptions.story}
            onChange={handleStoryChange}
            direction={direction}
          />
        </div>
      </Box>
    </Box>
  )
}

export default React.memo(AddProductStepOne)
