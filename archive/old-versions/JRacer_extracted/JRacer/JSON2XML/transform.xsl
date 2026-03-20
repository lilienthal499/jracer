<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:json="http://json.org/">
	    <xsl:param name="use-badgerfish" as="xs:boolean" select="true()"/>
    <xsl:import href="xml-to-json.xsl"/>
    <xsl:template match="jracer">
        <xsl:value-of select="json:generate(.)"/>
    </xsl:template>
</xsl:stylesheet>