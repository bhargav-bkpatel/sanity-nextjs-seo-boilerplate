import React, { useMemo } from "react";
import { NextSeo } from "next-seo";
import type { PropsWithChildren } from "react";
import { CustomImageType, MetaAttributeType, MetaTagType, OpenGraphType, SeoType } from "../../../lib";
import { MetaTag as NextSeoMetaTag, OpenGraph as NextSeoOpenGraph } from 'next-seo/lib/types'


export const getOpenGraph = (args: OpenGraphType) => {
    const { description, image, title, _type, siteName, url } = args
    const getImage = image ? resolveImage(image) : null
    const values = {
        _type,
        description,
        siteName,
        url,
        title,
        images: [{ url: getImage ?? '' }],
    }
    return values as NextSeoOpenGraph
}

export const getMetaObjects = (tags: MetaTagType[], allowIndexing?: boolean) => {
    const tagArray: NextSeoMetaTag[] = []
    tags.map(tag => {
        const excludeTag =
            !allowIndexing &&
            !!tag.metaAttributes?.find(
                i =>
                    i?.attributeValueString?.includes('noindex') ||
                    i?.attributeValueString?.includes('nofollow'),
            )
        if (!excludeTag) {
            const metaTag = getMetaAttribute(tag?.metaAttributes)
            if (metaTag) {
                tagArray.push(metaTag)
            }
        }
    })
    return tagArray
}

export const resolveImage = (image?: CustomImageType) => {
    return image?.asset?.url ?? "";
};

export const getMetaAttribute = (attrs: MetaAttributeType[] | undefined) => {
    if (!attrs) {
        return null
    }
    const obj: Record<string, string> = {}
    attrs.map((i) => {
        Object.assign(obj, {
            [i?.attributeKey as string]:
                i.attributeType == "image"
                    ? resolveImage(i?.attributeValueImage)
                    : i.attributeValueString,
        })
    })
    return obj as unknown as NextSeoMetaTag
}


interface LayoutProps {
    seo: SeoType | null;
    slug: string;
}

const CustomNextSeo: React.FC<PropsWithChildren<LayoutProps>> = ({
    children,
    seo,
    slug,
}) => {

    const { additionalMetaTags, metaDescription, metaTitle, twitter, nofollowAttributes, seoKeywords } = seo || {};

    const tags = useMemo(
        () => (additionalMetaTags ? getMetaObjects(additionalMetaTags) : []),
        [additionalMetaTags]
    );
    const openGraph = useMemo(
        () => (seo?.openGraph ? getOpenGraph(seo?.openGraph) : undefined),
        [seo]
    );
    const url = (process.env.NEXT_PUBLIC_APP_URL ?? "") + (slug?.startsWith("/") ? slug : `/${slug}`);

    return (
        <>
            <NextSeo
                themeColor=""
                twitter={{
                    handle: twitter?.creator,
                    site: twitter?.site,
                    cardType: twitter?.cardType,
                }}
                nofollow={nofollowAttributes}
                noindex={nofollowAttributes}
                openGraph={openGraph}
                canonical={url || ""}
                additionalMetaTags={((seoKeywords && seoKeywords?.length > 0
                    ? [{ name: "keywords", content: seoKeywords?.join(", ") }]
                    : []) as NextSeoMetaTag[]).concat(tags ?? [])}
                title={metaTitle ?? ""}
                description={metaDescription ?? ""}
            />
            {children}
        </>
    );
};

export default CustomNextSeo;